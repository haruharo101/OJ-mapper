const yamlFiles = import.meta.glob("../../problems/**/*.yaml", {
  eager: true,
  query: "?raw",
  import: "default",
});

const folderToOj = {
  boj: "BOJ",
  qoj: "QOJ",
  jungol: "Jungol",
  codeup: "Codeup",
  atcoder: "AtCoder",
  codeforces: "Codeforces",
  leetcode: "LeetCode",
};

function stripQuotes(value) {
  const trimmed = value.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

function problemKey(oj, id) {
  return `${oj.trim().toLowerCase()}:${id.trim().toLowerCase()}`;
}

function parseProblemFile(rawText) {
  const lines = rawText.split(/\r?\n/);
  const parsed = {
    oj: "",
    id: "",
    title: "",
    matches: [],
  };

  let currentMatch = null;
  let inMatches = false;

  for (const originalLine of lines) {
    const line = originalLine.replace(/\t/g, "  ");

    if (!line.trim() || line.trimStart().startsWith("#")) {
      continue;
    }

    if (!inMatches && /^oj:\s*/.test(line)) {
      parsed.oj = stripQuotes(line.replace(/^oj:\s*/, ""));
      continue;
    }

    if (!inMatches && /^id:\s*/.test(line)) {
      parsed.id = stripQuotes(line.replace(/^id:\s*/, ""));
      continue;
    }

    if (!inMatches && /^title:\s*/.test(line)) {
      parsed.title = stripQuotes(line.replace(/^title:\s*/, ""));
      continue;
    }

    if (/^matches:\s*$/.test(line)) {
      inMatches = true;
      continue;
    }

    if (!inMatches) {
      continue;
    }

    const matchOj = line.match(/^\s*-\s+oj:\s*(.+)$/);

    if (matchOj) {
      currentMatch = {
        oj: stripQuotes(matchOj[1]),
        id: "",
        relation: "",
      };
      parsed.matches.push(currentMatch);
      continue;
    }

    if (!currentMatch) {
      continue;
    }

    const matchId = line.match(/^\s+id:\s*(.+)$/);

    if (matchId) {
      currentMatch.id = stripQuotes(matchId[1]);
      continue;
    }

    const matchRelation = line.match(/^\s+relation:\s*(.+)$/);

    if (matchRelation) {
      currentMatch.relation = stripQuotes(matchRelation[1]);
    }
  }

  if (!parsed.oj || !parsed.id) {
    return null;
  }

  return parsed;
}

function buildProblemIndex(records) {
  const recordMap = new Map(
    records.map((record) => [problemKey(record.oj, record.id), record]),
  );
  const index = new Map();

  function ensureEntry(oj, id, title = "") {
    const key = problemKey(oj, id);

    if (!index.has(key)) {
      index.set(key, {
        problem: {
          oj,
          id,
          title,
        },
        related: [],
      });
    }

    const entry = index.get(key);

    if (!entry.problem.title && title) {
      entry.problem.title = title;
    }

    return entry;
  }

  function addRelated(baseOj, baseId, item) {
    const entry = ensureEntry(baseOj, baseId);
    const dedupeKey = problemKey(item.oj, item.id);

    if (
      entry.related.some(
        (related) =>
          problemKey(related.oj, related.id) === dedupeKey &&
          related.relation === item.relation,
      )
    ) {
      return;
    }

    entry.related.push(item);
  }

  for (const record of records) {
    ensureEntry(record.oj, record.id, record.title);

    for (const match of record.matches) {
      if (!match.oj || !match.id || !match.relation) {
        continue;
      }

      const targetRecord = recordMap.get(problemKey(match.oj, match.id));

      addRelated(record.oj, record.id, {
        oj: match.oj,
        id: match.id,
        title: targetRecord?.title ?? "",
        relation: match.relation,
      });

      ensureEntry(match.oj, match.id, targetRecord?.title ?? "");

      addRelated(match.oj, match.id, {
        oj: record.oj,
        id: record.id,
        title: record.title,
        relation: match.relation,
      });
    }
  }

  return Object.fromEntries(index.entries());
}

const parsedRecords = Object.values(yamlFiles)
  .map((rawText) => parseProblemFile(rawText))
  .filter(Boolean);

export const problemCounts = Object.keys(yamlFiles).reduce((counts, filePath) => {
  const match = filePath.match(/\.{2}\/\.{2}\/problems\/([^/]+)\//);

  if (!match) {
    return counts;
  }

  const folderName = match[1].toLowerCase();
  const ojName = folderToOj[folderName];

  if (!ojName) {
    return counts;
  }

  counts[ojName] = (counts[ojName] ?? 0) + 1;

  return counts;
}, {});

export const problemIndex = buildProblemIndex(parsedRecords);
