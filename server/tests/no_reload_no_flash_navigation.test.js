import assert from 'assert';
import { describe, it } from 'node:test';
import fs from 'fs';
import path from 'path';

describe('Addenda J, M, N, O & P: Persistent Layouts, Zero Flash, Top Bar Controls & Chat Composer', () => {
  it('Layout files must have internal Suspense boundaries and mount tracking', () => {
    const publicLayoutPath = path.resolve(process.cwd(), '../client/src/layouts/PublicLayout.jsx');
    const authLayoutPath = path.resolve(process.cwd(), '../client/src/layouts/AuthLayout.jsx');
    const appLayoutPath = path.resolve(process.cwd(), '../client/src/layouts/AppLayout.jsx');

    const publicContent = fs.readFileSync(publicLayoutPath, 'utf8');
    const authContent = fs.readFileSync(authLayoutPath, 'utf8');
    const appContent = fs.readFileSync(appLayoutPath, 'utf8');

    assert.ok(publicContent.includes('Suspense'), 'PublicLayout must contain internal Suspense');
    assert.ok(authContent.includes('Suspense'), 'AuthLayout must contain internal Suspense');
    assert.ok(appContent.includes('Suspense'), 'AppLayout must contain internal Suspense');

    assert.ok(publicContent.includes('__publicLayoutMountCount'), 'PublicLayout must track mount count');
    assert.ok(appContent.includes('__appLayoutMountCount'), 'AppLayout must track mount count');
  });

  it('App.jsx must NOT wrap all Routes in top-level Suspense fallback', () => {
    const appJsxPath = path.resolve(process.cwd(), '../client/src/App.jsx');
    const appContent = fs.readFileSync(appJsxPath, 'utf8');

    assert.strictEqual(
      appContent.includes('<Suspense fallback={<PageLoader />}>'),
      false,
      'Top-level Suspense wrapper around all Routes must be removed to prevent whole-page screen flashing'
    );
  });

  it('AppLayout must render static sidebar user card and top bar GithubConnectButton, Go to GitHub & ProfileAvatarMenu', () => {
    const appLayoutPath = path.resolve(process.cwd(), '../client/src/layouts/AppLayout.jsx');
    const appContent = fs.readFileSync(appLayoutPath, 'utf8');

    assert.ok(appContent.includes('GithubConnectButton'), 'AppLayout must contain GithubConnectButton');
    assert.ok(appContent.includes('Go to GitHub'), 'AppLayout must contain "Go to GitHub" button (Addendum P)');
    assert.ok(appContent.includes('ProfileAvatarMenu'), 'AppLayout must contain ProfileAvatarMenu (Addendum O)');
    assert.ok(appContent.includes('cursor-default'), 'Sidebar user card must be static display-only with cursor-default');
  });

  it('ChatTab composer must support native file input and Enter for newline', () => {
    const chatTabPath = path.resolve(process.cwd(), '../client/src/pages/tabs/ChatTab.jsx');
    const chatContent = fs.readFileSync(chatTabPath, 'utf8');

    assert.ok(chatContent.includes('fileInputRef'), 'ChatTab must reference hidden native file input');
    assert.ok(chatContent.includes('Enter for new line'), 'Composer must display hint "Enter for new line, Ctrl/Cmd+Enter to send"');
  });

  it('NotificationPanel component and Notification model must exist', () => {
    const notifPanelPath = path.resolve(process.cwd(), '../client/src/components/NotificationPanel.jsx');
    const notifModelPath = path.resolve(process.cwd(), './src/models/Notification.js');

    assert.ok(fs.existsSync(notifPanelPath), 'NotificationPanel.jsx component must exist');
    assert.ok(fs.existsSync(notifModelPath), 'Notification model must exist');
  });
});
