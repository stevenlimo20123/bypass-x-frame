"use client";

import { useMemo, useState } from "react";

const DEFAULT_URL = "https://example.com";

function normalizeUrl(value) {
  const trimmed = value.trim();
  if (!trimmed) return DEFAULT_URL;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export default function HomePage() {
  const [value, setValue] = useState(DEFAULT_URL);
  const [target, setTarget] = useState(DEFAULT_URL);

  const frameSrc = useMemo(() => {
    return `/proxy/${encodeURIComponent(target)}`;
  }, [target]);

  return (
    <main className="container">
      <form
        className="controls"
        onSubmit={(event) => {
          event.preventDefault();
          setTarget(normalizeUrl(value));
        }}
      >
        <input
          className="input"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="https://example.com"
        />
        <button className="button" type="submit">
          Load
        </button>
      </form>
      <p className="note">
        Tip: enter any URL, then this app proxies it through <code>/proxy/&lt;url&gt;</code>.
      </p>
      <iframe className="frame" src={frameSrc} title="proxied-site" allow="fullscreen" />
    </main>
  );
}
