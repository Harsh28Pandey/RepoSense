import mongoose from 'mongoose';
import { ChatSession, ChatMessage } from '../models/index.js';
import { executeAiQuery } from '../utils/llmRouter.js';
import { searchRepoChunks } from '../utils/vectorStore.js';

export async function getChatSessions(userId) {
  if (!userId) return [];
  return await ChatSession.find({ userId }).sort({ isPinned: -1, updatedAt: -1 });
}

export async function createChatSession({ title = 'New Chat Session', contextScope = 'current', responseStyle = 'short', preferredAi = 'auto', repoId, userId }) {
  if (!userId) throw { statusCode: 401, message: 'Unauthorized' };

  // Re-use existing empty session if available
  const existingEmpty = await ChatSession.findOne({ userId, title: 'New Chat Session' }).sort({ createdAt: -1 });
  if (existingEmpty) {
    const msgCount = await ChatMessage.countDocuments({ sessionId: existingEmpty._id });
    if (msgCount === 0) return existingEmpty;
  }
  
  const session = await ChatSession.create({
    userId,
    repoId,
    title,
    contextScope,
    responseStyle,
    preferredAi
  });
  return session;
}

export async function updateChatSession(sessionId, userId, updateData) {
  if (!userId || !sessionId || !mongoose.Types.ObjectId.isValid(sessionId)) {
    throw { statusCode: 404, message: 'Session not found' };
  }
  const session = await ChatSession.findOneAndUpdate(
    { _id: sessionId, userId },
    { $set: updateData },
    { new: true }
  );
  if (!session) throw { statusCode: 404, message: 'Session not found' };
  return session;
}

export async function duplicateChatSession(sessionId, userId) {
  if (!userId || !sessionId || !mongoose.Types.ObjectId.isValid(sessionId)) {
    throw { statusCode: 404, message: 'Session not found' };
  }
  const session = await ChatSession.findOne({ _id: sessionId, userId });
  if (!session) throw { statusCode: 404, message: 'Session not found' };

  const newSession = await ChatSession.create({
    userId,
    repoId: session.repoId,
    title: `${session.title} (Copy)`,
    contextScope: session.contextScope,
    responseStyle: session.responseStyle,
    preferredAi: session.preferredAi
  });

  const messages = await ChatMessage.find({ sessionId }).sort({ createdAt: 1 });
  if (messages.length > 0) {
    const copyMessages = messages.map(m => ({
      userId,
      sessionId: newSession._id,
      sender: m.sender,
      content: m.content,
      problemDescription: m.problemDescription,
      solutionText: m.solutionText,
      actionButton: m.actionButton,
      sourcesUsed: m.sourcesUsed,
      aiProviderUsed: m.aiProviderUsed,
      attachmentUrl: m.attachmentUrl,
      attachmentType: m.attachmentType
    }));
    await ChatMessage.insertMany(copyMessages);
  }
  return newSession;
}

export async function getSessionMessages(sessionId, userId) {
  if (!userId || !sessionId || !mongoose.Types.ObjectId.isValid(sessionId)) return [];
  const session = await ChatSession.findOne({ _id: sessionId, userId });
  if (!session) return [];
  return await ChatMessage.find({ sessionId }).sort({ createdAt: 1 });
}

export async function sendMessageToSession({ sessionId, userContent, repoId, attachmentUrl, attachmentType, preferredAi = 'auto', userId }) {
  if (!userId || !sessionId || !mongoose.Types.ObjectId.isValid(sessionId)) {
    throw { statusCode: 404, message: 'Chat session not found' };
  }
  const session = await ChatSession.findOne({ _id: sessionId, userId });
  if (!session) {
    throw { statusCode: 404, message: 'Chat session not found' };
  }

  // 1. Save user message
  await ChatMessage.create({
    userId,
    sessionId,
    sender: 'user',
    content: userContent,
    attachmentUrl,
    attachmentType
  });

  // Auto-generate title if default
  if (session.title === 'New Chat Session' || session.title === 'New Chat') {
    try {
      const summary = await executeAiQuery({
        prompt: `Generate a concise, 4-to-6 word title for this user query: "${userContent}". Output ONLY the title, no quotes or markdown.`,
        preferredProvider: 'auto'
      });
      const cleanTitle = (summary.text || userContent).replace(/["']/g, '').trim().slice(0, 50);
      session.title = cleanTitle || 'Chat Session';
      await session.save();
    } catch (e) {
      session.title = userContent.slice(0, 30) + '...';
      await session.save();
    }
  }

  // 2. Perform RAG retrieval
  const ragChunks = repoId ? await searchRepoChunks(repoId, userContent, 3) : [];
  const sourcesUsed = ragChunks.map(c => c.filePath);
  const contextStr = ragChunks.map(c => `[File: ${c.filePath}]\n${c.contentChunk}`).join('\n\n');

  // 3. AI Execution
  const aiResult = await executeAiQuery({
    prompt: userContent,
    preferredProvider: preferredAi,
    contextData: contextStr
  });

  // 4. Structure assistant answer
  const lower = userContent.toLowerCase();
  let problemDescription = null;
  let actionButton = null;

  if (lower.includes('readme') || lower.includes('missing readme')) {
    problemDescription = 'Missing or incomplete README.md file detected.';
    actionButton = {
      label: 'Generate README',
      action: 'GENERATE_README',
      tabTarget: '/app/readme'
    };
  } else if (lower.includes('pr') || lower.includes('pull request') || lower.includes('review')) {
    problemDescription = 'Pending Pull Requests require automated code review.';
    actionButton = {
      label: 'Review PR',
      action: 'REVIEW_PR',
      tabTarget: '/app/review'
    };
  } else if (lower.includes('health score') || lower.includes('deep scan')) {
    problemDescription = 'Repo health score or scan report requested.';
    actionButton = {
      label: 'Run Deep Scan',
      action: 'RUN_SCAN',
      tabTarget: '/app/scan'
    };
  } else if (lower.includes('auto fix') || lower.includes('unused import')) {
    problemDescription = 'Formatting or unused import issues detected.';
    actionButton = {
      label: 'Create Fix PR',
      action: 'CREATE_FIX_PR',
      tabTarget: '/app/fix'
    };
  }

  const assistantMsg = await ChatMessage.create({
    userId,
    sessionId,
    sender: 'assistant',
    content: aiResult.text,
    problemDescription,
    solutionText: aiResult.text,
    actionButton,
    sourcesUsed,
    aiProviderUsed: aiResult.provider
  });

  await ChatSession.updateOne({ _id: sessionId }, { updatedAt: new Date() });

  return assistantMsg;
}

export async function deleteChatSession(sessionId, userId) {
  if (!userId || !sessionId || !mongoose.Types.ObjectId.isValid(sessionId)) {
    return { success: false };
  }
  const result = await ChatSession.deleteOne({ _id: sessionId, userId });
  if (result.deletedCount > 0) {
    await ChatMessage.deleteMany({ sessionId });
  }
  return { success: result.deletedCount > 0 };
}

export async function clearChatSessionMessages(sessionId, userId) {
  if (!userId || !sessionId || !mongoose.Types.ObjectId.isValid(sessionId)) {
    return { success: false };
  }
  const session = await ChatSession.findOne({ _id: sessionId, userId });
  if (!session) return { success: false };

  await ChatMessage.deleteMany({ sessionId });
  return { success: true };
}
