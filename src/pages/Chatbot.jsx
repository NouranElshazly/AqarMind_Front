import { useEffect, useRef, useState, startTransition } from "react";
import "../styles/Chatbot.css";

const apiBase = import.meta.env.VITE_CHATBOT_API_BASE || "http://localhost:8010";

const assistantAvatar = "AI";
const userAvatar = "You";

function buildInitialMessages(question) {
    if (!question) {
        return [];
    }

    return [
        {
            id: `assistant-${question.id}`,
            role: "assistant",
            text: question.prompt
        }
    ];
}

function formatAnswer(answer) {
    if (Array.isArray(answer)) {
        return answer.join(", ");
    }

    if (typeof answer === "boolean") {
        return answer ? "Yes" : "No";
    }

    return String(answer ?? "");
}

function recommendationLabel(item) {
    const details = [];

    if (item.details?.rooms) {
        details.push(`${item.details.rooms} beds`);
    }

    if (item.details?.bathrooms) {
        details.push(`${item.details.bathrooms} baths`);
    }

    if (item.details?.area) {
        details.push(`${item.details.area} m²`);
    }

    return details.join(" • ");
}

function safeJsonParse(value) {
    try {
        return JSON.parse(value);
    } catch {
        return null;
    }
}

function decodeJwtPayload(token) {
    try {
        const parts = token.split(".");
        if (parts.length < 2) {
            return null;
        }

        const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        return JSON.parse(window.atob(base64));
    } catch {
        return null;
    }
}

function extractUserIdFromObject(objectValue) {
    if (!objectValue || typeof objectValue !== "object") {
        return "";
    }

    const directKeys = ["userId", "userid", "user_id", "id", "sub", "nameid", "nameidentifier"];

    for (const key of directKeys) {
        if (objectValue[key]) {
            return String(objectValue[key]);
        }
    }

    if (objectValue.user && typeof objectValue.user === "object") {
        return extractUserIdFromObject(objectValue.user);
    }

    if (objectValue.profile && typeof objectValue.profile === "object") {
        return extractUserIdFromObject(objectValue.profile);
    }

    return "";
}

function detectUserIdFromStorage() {
    const directKeys = ["userId", "user_id", "userid", "currentUserId", "tenantId", "id"];

    for (const key of directKeys) {
        const rawValue = localStorage.getItem(key);
        if (rawValue?.trim()) {
            return rawValue.trim();
        }
    }

    const objectKeys = ["user", "currentUser", "auth", "authData", "profile", "session"];
    for (const key of objectKeys) {
        const parsed = safeJsonParse(localStorage.getItem(key) || "");
        const extracted = extractUserIdFromObject(parsed);
        if (extracted) {
            return extracted;
        }
    }

    const tokenKeys = ["token", "accessToken", "jwt", "authToken"];
    for (const key of tokenKeys) {
        const token = localStorage.getItem(key);
        if (!token) {
            continue;
        }

        const payload = decodeJwtPayload(token);
        const extracted =
            payload?.nameid ||
            payload?.sub ||
            payload?.userId ||
            payload?.user_id ||
            payload?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];

        if (extracted) {
            return String(extracted);
        }
    }

    return "";
}

export default function Chatbot() {
    const [userId, setUserId] = useState("");
    const [session, setSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [answer, setAnswer] = useState("");
    const [starting, setStarting] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");
    const chatContainerRef = useRef(null);

    useEffect(() => {
        setUserId(detectUserIdFromStorage());
    }, []);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [messages]);

    async function startSession() {
        setStarting(true);
        setError("");

        try {
            const response = await fetch(`${apiBase}/api/chatbot/sessions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user_id: userId,
                    language: "en"
                })
            });

            if (!response.ok) {
                throw new Error("Unable to start the chat session");
            }

            const data = await response.json();
            startTransition(() => {
                setSession(data);
                setMessages(buildInitialMessages(data.next_question));
            });
        } catch (requestError) {
            setError(requestError.message || "Something went wrong while starting the session");
        } finally {
            setStarting(false);
        }
    }

    async function submitAnswer(event) {
        event.preventDefault();

        if (!answer.trim() || !session?.session_id || sending) {
            return;
        }

        const nextMessages = [
            ...messages,
            {
                id: `user-${Date.now()}`,
                role: "user",
                text: answer.trim()
            }
        ];

        setMessages(nextMessages);
        setSending(true);
        setError("");

        try {
            const response = await fetch(`${apiBase}/api/chatbot/sessions/${session.session_id}/answer`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    answer: answer.trim()
                })
            });

            if (!response.ok) {
                throw new Error("Unable to submit your answer");
            }

            const data = await response.json();

            startTransition(() => {
                setSession(data);
                setAnswer("");
                if (data.next_question) {
                    setMessages([
                        ...nextMessages,
                        {
                            id: `assistant-${data.next_question.id}-${Date.now()}`,
                            role: "assistant",
                            text: data.next_question.prompt
                        }
                    ]);
                } else {
                    setMessages([
                        ...nextMessages,
                        {
                            id: `assistant-complete-${Date.now()}`,
                            role: "assistant",
                            text:
                                data.recommendation_mode === "recommended"
                                    ? "We could not find a strong exact match in the system, but here are the closest recommendations."
                                    : "Your answers are complete. Here are the top matching properties."
                        }
                    ]);
                }
            });
        } catch (requestError) {
            setError(requestError.message || "Something went wrong while sending your answer");
        } finally {
            setSending(false);
        }
    }

    const answersPreview = session?.answers ? Object.entries(session.answers) : [];

    return (
        <div className="page-shell">
            <div className="ambient ambient-one" />
            <div className="ambient ambient-two" />

            <header className="chatbot-page-header">
                <h1 className="chatbot-page-title">AqarMind Chatbot</h1>
                <p className="chatbot-page-subtitle">I'm here to help you anytime, 24/7.</p>
            </header>

            <main className="app-grid">
                <section className="hero-panel">
                    <div className="eyebrow">AI Property Matchmaker</div>
                    <h1>Find the top 5 properties that best match your answers.</h1>
                    <p className="hero-copy">
            Simply answer a few questions about your preferences, and our AI will find the most suitable properties tailored just for you.
          </p>

                    <div className="start-card">
                        <button className="primary-button" onClick={startSession} disabled={starting || !userId}>
                            {starting ? "Starting session..." : "Start Chat"}
                        </button>
                    </div>

                    {answersPreview.length > 0 ? (
                        <div className="answers-card">
                            <h2>Your Preferences</h2>
                            <div className="answers-tags">
                                {answersPreview.map(([key, value]) => (
                                    <span key={key} className="answer-tag">
                                        {key}: {formatAnswer(value)}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </section>

                <section className="chat-panel">
                    <div className="panel-head">
                        <div>
                            <div className="panel-title">Conversation</div>
                            <div className="panel-subtitle">
                                {session?.status === "completed"
                                    ? "Recommendations are ready"
                                    : "Answer the questions to get your best property matches"}
                            </div>
                        </div>
                        <div className="confidence-pill">Confidence {Math.round((session?.confidence || 0) * 100)}%</div>
                    </div>

                    <div className="messages-area" ref={chatContainerRef}>
                        {messages.length === 0 ? (
                            <div className="empty-state">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <p>Start the conversation to find your perfect home matches.</p>
                            </div>
                        ) : (
                            messages.map((message) => (
                                <article key={message.id} className={`message-row ${message.role}`}>
                                    <div className="message-avatar">
                                        {message.role === "assistant" ? (
                                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        ) : (
                                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="message-bubble">{message.text}</div>
                                </article>
                            ))
                        )}
                    </div>

                    <form className="composer" onSubmit={submitAnswer}>
                        <textarea
                            className="composer-input"
                            value={answer}
                            onChange={(event) => setAnswer(event.target.value)}
                            placeholder={session?.status === "completed" ? "The questionnaire is complete" : "Type your answer here..."}
                            disabled={!session || session?.status === "completed" || sending}
                        />
                        <button
                            type="submit"
                            className="primary-button"
                            disabled={!session || session?.status === "completed" || sending || !answer.trim()}
                        >
                            {sending ? "Sending..." : "Send Answer"}
                        </button>
                    </form>

                    {error ? <div className="error-banner">{error}</div> : null}
                </section>
            </main>

            <section className="results-section">
                <div className="results-head">
                    <h2>Top 5 Results</h2>
                    <p>
                        Each property includes its match percentage. If every result is below 50%, these are shown as the closest
                        available recommendations in your system.
                    </p>
                </div>

                {session?.status === "completed" ? (
                    <div className={`results-notice ${session?.recommendation_mode === "recommended" ? "warning" : "success"}`}>
                        {session?.recommendation_mode === "recommended"
                            ? "There is no strong match for your answers in the current system. These are the closest recommendations."
                            : "These are the strongest matches based on your answers."}
                    </div>
                ) : null}

                <div className="results-grid">
                    {(session?.recommendations || []).map((item) => (
                        <article key={item.post_id} className="result-card">
                            <div className="result-image-container">
                                {item.image ? (
                                    <img className="result-image" src={item.image} alt={item.title} />
                                ) : (
                                    <div className="result-image placeholder">
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="48" height="48">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span>No Image Available</span>
                                    </div>
                                )}
                                <div className="match-badge">{item.match_percentage}% Match</div>
                                <div className="location-badge">{item.location || "Available Now"}</div>
                            </div>

                            <div className="result-body">
                                <h3>{item.title}</h3>
                                <div className="price-line">{Number(item.price || 0).toLocaleString()} EGP</div>
                                <div className="spec-line">
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    {recommendationLabel(item)}
                                </div>
                                <div className="reasons-list">
                                    {item.reasons?.map((reason) => (
                                        <span key={`${item.post_id}-${reason}`} className="reason-pill">
                                            {reason}
                                        </span>
                                    ))}
                                </div>
                                <a className="secondary-button" href={item.url} target="_blank" rel="noreferrer">
                                    View Property Details
                                </a>
                            </div>
                        </article>
                    ))}

                    {session?.status !== "completed" ? (
                        <div className="results-placeholder">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="48" height="48" style={{ marginBottom: '1rem', opacity: 0.3 }}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            <p>Complete the conversation and the top matching properties will appear here.</p>
                        </div>
                    ) : null}
                </div>
            </section>
        </div>
    );
}
