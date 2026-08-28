import { useState } from "react";
import type { Block, Dive } from "../content/steps";

function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        switch (b.kind) {
          case "p":
            return <p key={i}>{b.text}</p>;
          case "list":
            return (
              <ul key={i}>
                {b.items.map((it, j) => (
                  <li key={j}>{it}</li>
                ))}
              </ul>
            );
          case "table":
            return (
              <div key={i} className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      {b.headers.map((h, j) => (
                        <th key={j}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.map((row, j) => (
                      <tr key={j}>
                        {row.map((cell, k) => (
                          <td key={k}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case "code":
            return (
              <pre key={i}>
                <code>{b.code}</code>
              </pre>
            );
          case "quote":
            return (
              <blockquote key={i}>
                <p>{b.text}</p>
              </blockquote>
            );
        }
      })}
    </>
  );
}

export default function DeepDive({ dive }: { dive: Dive }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`dive${open ? " open" : ""}`}>
      <button className="dive-toggle" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="dive-arrow">{open ? "▾" : "▸"}</span>
        <span className="dive-label">
          深潜 · {dive.title}
        </span>
      </button>
      {open && (
        <div className="dive-body">
          <Blocks blocks={dive.blocks} />
        </div>
      )}
    </div>
  );
}
