const labels = ["Too weak", "Weak", "Fair", "Good", "Strong"];
const colors = ["bg-rose-400", "bg-rose-400", "bg-amber-400", "bg-emerald-300", "bg-emerald-400"];

function getScore(password) {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
}

export default function PasswordStrength({ password }) {
    if (!password) return null;
    const score = getScore(password);

    return (
        <div className="mt-2">
            <div className="flex gap-1">
                {[0, 1, 2, 3].map((index) => (
                    <span key={index} className={`h-1 flex-1 rounded-full ${index < score ? colors[score] : "bg-slate-800"}`} />
                ))}
            </div>
            <p className="mt-1 text-xs text-slate-500">Password strength: {labels[score]}</p>
        </div>
    );
}