"use client";

export default function SentryExamplePage() {
  return (
    <div style={{ padding: "50px", textAlign: "center" }}>
      <h1>Sentry Test Page</h1>
      <p>Click the button below to throw a test error and complete Sentry onboarding.</p>
      <button
        onClick={() => {
          throw new Error("Sentry Test Error from LetsTryFoods Frontend");
        }}
        style={{
          padding: "10px 20px",
          backgroundColor: "#ff4d4f",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          marginTop: "20px",
        }}
      >
        Throw Test Error
      </button>
    </div>
  );
}
