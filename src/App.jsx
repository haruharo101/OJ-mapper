import { useState } from "react";
import GraphBackground from "./components/GraphBackground";
import { problemIndex } from "./data/problemIndex";
import linkTemplates from "./data/link_template.json";

const onlineJudges = [
  "BOJ",
  "QOJ",
  "Jungol",
  "Codeup",
  "AtCoder",
  "Codeforces",
  "LeetCode",
];

const relationLabel = {
  same: "Same Problem",
  similar: "Similar Problem",
};

const allowedLinkHosts = {
  BOJ: ["www.acmicpc.net", "acmicpc.net"],
  QOJ: ["qoj.ac"],
  Jungol: ["jungol.co.kr", "www.jungol.co.kr"],
  Codeup: ["codeup.kr", "www.codeup.kr"],
  AtCoder: ["atcoder.jp", "www.atcoder.jp"],
  Codeforces: ["codeforces.com", "www.codeforces.com"],
  LeetCode: ["leetcode.com", "www.leetcode.com"],
};

const inputExamples = {
  BOJ: [
    {
      source: "acmicpc.net/problem/1000",
      result: "1000",
    },
  ],
  QOJ: [
    {
      source: "qoj.ac/problem/1000",
      result: "1000",
    },
  ],
  Jungol: [
    {
      source: "jungol.co.kr/problem/1234",
      result: "1234",
    },
  ],
  Codeup: [
    {
      source: "codeup.kr/problem.php?id=1001",
      result: "1001",
    },
  ],
  Codeforces: [
    {
      source: "codeforces.com/problemset/problem/2220/A",
      result: "2220A",
    },
    {
      source: "codeforces.com/contest/2220/problem/A",
      result: "2220A",
    },
  ],
  AtCoder: [
    {
      source: "atcoder.jp/contests/abc453/tasks/abc453_a",
      result: "abc354_a",
    },
  ],
  LeetCode: [
    {
      source: "leetcode.com/problems/two-sum/",
      result: "two-sum",
    },
  ],
};

const inputPlaceholders = {
  BOJ: "1000",
  QOJ: "1000",
  Jungol: "1234",
  Codeup: "1001",
  Codeforces: "2220A",
  AtCoder: "abc354_a",
  LeetCode: "two-sum",
};

function makeProblemKey(oj, id) {
  return `${oj}:${id.trim().toLowerCase()}`;
}

function normalizeProblemId(oj, rawValue) {
  const value = rawValue.trim();

  if (!value) {
    return null;
  }

  if (oj === "BOJ" || oj === "QOJ" || oj === "Jungol") {
    const match =
      value.match(/^(\d{1,50})$/) ??
      value.match(/\/problem\/(\d{1,50})(?:[/?#]|$)/i);

    return match ? match[1] : null;
  }

  if (oj === "Codeup") {
    const match =
      value.match(/^(\d{1,50})$/) ??
      value.match(/[?&]id=(\d{1,50})(?:[&#]|$)/i);

    return match ? match[1] : null;
  }

  if (oj === "Codeforces") {
    const compactMatch = value.match(/^(\d{1,20})([a-z]\d*)$/i);

    if (compactMatch) {
      return `${compactMatch[1]}${compactMatch[2].toUpperCase()}`;
    }

    const urlMatch =
      value.match(/\/problemset\/problem\/(\d{1,20})\/([a-z]\d*)(?:[/?#]|$)/i) ??
      value.match(/\/contest\/(\d{1,20})\/problem\/([a-z]\d*)(?:[/?#]|$)/i);

    return urlMatch ? `${urlMatch[1]}${urlMatch[2].toUpperCase()}` : null;
  }

  if (oj === "AtCoder") {
    const compactMatch = value.match(/^([a-z0-9]+_[a-z0-9]+)$/i);

    if (compactMatch) {
      return compactMatch[1].toLowerCase();
    }

    const urlMatch = value.match(/\/tasks\/([a-z0-9]+_[a-z0-9]+)(?:[/?#]|$)/i);

    return urlMatch ? urlMatch[1].toLowerCase() : null;
  }

  if (oj === "LeetCode") {
    const compactMatch = value.match(/^([a-z0-9-]{1,50})$/i);

    if (compactMatch) {
      return compactMatch[1].toLowerCase();
    }

    const urlMatch = value.match(/\/problems\/([a-z0-9-]{1,50})(?:[/?#]|$)/i);

    return urlMatch ? urlMatch[1].toLowerCase() : null;
  }

  return null;
}

function buildProblemUrl(oj, id) {
  const template = linkTemplates[oj];
  const trimmedId = id.trim();
  const normalizedId = trimmedId.toLowerCase();

  if (!template) {
    return "#";
  }

  if (oj === "AtCoder") {
    const contest = normalizedId.split("_")[0];
    const candidate = template
      .replace("{contest}", contest)
      .replace("{task}", normalizedId);

    return validateProblemUrl(oj, candidate);
  }

  if (oj === "Codeforces") {
    const match = trimmedId.match(/^(\d+)([a-z]\d*)$/i);

    if (!match) {
      return "#";
    }

    const candidate = template
      .replace("{contest}", match[1])
      .replace("{index}", match[2].toUpperCase());

    return validateProblemUrl(oj, candidate);
  }

  if (oj === "LeetCode") {
    const candidate = template.replace("{slug}", normalizedId);

    return validateProblemUrl(oj, candidate);
  }

  const candidate = template.replace("{id}", encodeURIComponent(trimmedId));

  return validateProblemUrl(oj, candidate);
}

function validateProblemUrl(oj, value) {
  try {
    const parsed = new URL(value);

    if (parsed.protocol !== "https:") {
      return null;
    }

    if (!allowedLinkHosts[oj]?.includes(parsed.hostname)) {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
}

export default function App() {
  const [selectedJudge, setSelectedJudge] = useState("BOJ");
  const [problemId, setProblemId] = useState("");
  const [searchState, setSearchState] = useState({
    status: "idle",
    query: null,
    entry: null,
    message: null,
  });

  function handleSearch(event) {
    event.preventDefault();

    const trimmedId = problemId.trim();

    if (!trimmedId) {
      setSearchState({
        status: "idle",
        query: null,
        entry: null,
        message: null,
      });
      return;
    }

    const normalizedId = normalizeProblemId(selectedJudge, trimmedId);

    if (!normalizedId) {
      setSearchState({
        status: "invalid",
        query: {
          oj: selectedJudge,
          id: trimmedId,
        },
        entry: null,
        message: `Invalid ${selectedJudge} problem ID format.`,
      });
      return;
    }

    const entry = problemIndex[makeProblemKey(selectedJudge.toLowerCase(), normalizedId)];

    if (!entry) {
      setSearchState({
        status: "empty",
        query: {
          oj: selectedJudge,
          id: normalizedId,
        },
        entry: null,
        message: null,
      });
      return;
    }

    setSearchState({
      status: "success",
      query: {
        oj: selectedJudge,
        id: normalizedId,
      },
      entry,
      message: null,
    });
  }

  return (
    <>
      <GraphBackground />
      <main className="app-shell">
        <section className="workspace">
          <div className="workspace__copy">
            <p className="eyebrow">Find Same or Similar Problems by Online Judge and Problem ID</p>
            <h1>OJ Mapper</h1>
            <p className="summary">
              Enter a base Online Judge and problem ID to search stored matches
              across other judges for the same or similar problem.
            </p>
          </div>

          <form
            className="search-panel"
            role="search"
            aria-label="Problem search"
            onSubmit={handleSearch}
          >
            <div className="field-group field-group--compact">
              <label className="field-label" htmlFor="online-judge">
                Online Judge
              </label>
              <div className="field-wrap field-wrap--select">
                <select
                  id="online-judge"
                  value={selectedJudge}
                  onChange={(event) => setSelectedJudge(event.target.value)}
                >
                  {onlineJudges.map((judge) => (
                    <option key={judge} value={judge}>
                      {judge}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="field-group field-group--wide">
              <label className="field-label" htmlFor="problem-id">
                Problem Number
              </label>
              <div className="field-wrap field-wrap--search">
                <span className="field-icon" aria-hidden="true">
                  #
                </span>
                <input
                  id="problem-id"
                  type="text"
                  value={problemId}
                  onChange={(event) => setProblemId(event.target.value)}
                  placeholder={inputPlaceholders[selectedJudge] ?? "1000"}
                  maxLength={50}
                />
                <span className="search-shortcut" aria-hidden="true">
                  Press Enter
                </span>
                <button
                  type="submit"
                  className="search-trigger"
                  aria-label="Search related problems"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="11" cy="11" r="6.5" />
                    <path d="M16 16L21 21" />
                  </svg>
                </button>
              </div>
            </div>
          </form>

          {inputExamples[selectedJudge] ? (
            <div className="input-examples" aria-live="polite">
              <p className="input-examples__title">Input Examples</p>
              <div className="input-example-list">
                {inputExamples[selectedJudge].map((example) => (
                  <div
                    key={`${example.source}-${example.result}`}
                    className="input-example"
                  >
                    <span className="input-example__source">{example.source}</span>
                    <span className="input-example__arrow" aria-hidden="true">
                      →
                    </span>
                    <strong className="input-example__result">{example.result}</strong>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

        <div className="panel-footer" aria-label="Supported online judges">
          <div className="judge-list">
            {onlineJudges.map((judge) => (
              <button
                key={judge}
                  type="button"
                  className={`judge-pill${selectedJudge === judge ? " judge-pill--active" : ""}`}
                  onClick={() => setSelectedJudge(judge)}
                  aria-pressed={selectedJudge === judge}
                >
                {judge}
              </button>
            ))}
          </div>
        </div>

        <section className="results-panel" aria-live="polite">
          <div className="results-header">
            <h2>Search Results</h2>
          </div>

          {searchState.status === "invalid" ? (
            <p className="results-empty">{searchState.message}</p>
          ) : null}

          {searchState.status === "empty" ? (
            <p className="results-empty">
              No stored mapping exists yet for {searchState.query.oj}{" "}
                {searchState.query.id}.
              </p>
            ) : null}

            {searchState.status === "success" ? (
              <>
                <ol className="result-list">
                  {searchState.entry.related.map((item) => {
                    const problemUrl = buildProblemUrl(item.oj, item.id);

                    return (
                      <li
                        key={`${item.oj}:${item.id}:${item.relation}`}
                        className="result-item"
                      >
                        <a
                          className={`result-link${problemUrl ? "" : " result-link--disabled"}`}
                          href={problemUrl ?? undefined}
                          target="_blank"
                          rel="noreferrer noopener"
                          aria-disabled={!problemUrl}
                          onClick={(event) => {
                            if (!problemUrl) {
                              event.preventDefault();
                            }
                          }}
                        >
                          <div className="result-main">
                            <div className="result-idline">
                              <strong>
                                {item.oj} {item.id}
                              </strong>
                            <span
                              className={`result-relation result-relation--${item.relation}`}
                            >
                              {relationLabel[item.relation] ?? item.relation}
                            </span>
                          </div>
                          <p>{item.title || "Title not added yet"}</p>
                        </div>
                        <span className="result-arrow" aria-hidden="true">→</span>
                      </a>
                      </li>
                    );
                  })}
                </ol>
              </>
            ) : null}
          </section>
        </section>
      </main>
    </>
  );
}
