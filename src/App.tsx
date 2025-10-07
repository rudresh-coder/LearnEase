
export default function App() {
  return (
    <div style={{ width: 320, padding: 16, fontFamily: "sans-serif" }}>
      <h2>LearnEase</h2>
      <p>Popup test — Word Counter / Timers will go here.</p>
      <button onClick={() => {
        chrome.runtime.sendMessage({ type: "PING" }, (resp) => {
          console.log("bg response:", resp);
        });
      }}>Ping background</button>
    </div>
  );
}