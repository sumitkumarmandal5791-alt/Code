const assert = require("node:assert/strict");
const { describe, it } = require("node:test");
const { parseYoutubeUrl } = require("../utils/youtubeParser");
const { normalizeTitle } = require("../scripts/seed-videos");

describe("YouTube URL Parser & Normalizer Test Suite", () => {
  it("parses standard youtube.com watch URL without timestamp", () => {
    const res = parseYoutubeUrl("https://www.youtube.com/watch?v=KLlXCFG5TnA");
    assert.deepEqual(res, {
      videoId: "KLlXCFG5TnA",
      startTime: 0,
    });
  });

  it("parses youtube.com watch URL with seconds timestamp with 's'", () => {
    const res = parseYoutubeUrl("https://www.youtube.com/watch?v=T0u5nwSA0w0&t=14286s");
    assert.deepEqual(res, {
      videoId: "T0u5nwSA0w0",
      startTime: 14286,
    });
  });

  it("parses youtube.com watch URL with seconds timestamp without 's'", () => {
    const res = parseYoutubeUrl("https://www.youtube.com/watch?v=T0u5nwSA0w0&t=14286");
    assert.deepEqual(res, {
      videoId: "T0u5nwSA0w0",
      startTime: 14286,
    });
  });

  it("parses youtu.be short URL with timestamp parameter", () => {
    const res = parseYoutubeUrl("https://youtu.be/G0_I-ZF0S38?t=120");
    assert.deepEqual(res, {
      videoId: "G0_I-ZF0S38",
      startTime: 120,
    });
  });

  it("parses youtu.be short URL without timestamp", () => {
    const res = parseYoutubeUrl("https://youtu.be/WTzjTskDFMg");
    assert.deepEqual(res, {
      videoId: "WTzjTskDFMg",
      startTime: 0,
    });
  });

  it("parses embed and compound duration timestamps (1h2m3s)", () => {
    const res = parseYoutubeUrl("https://www.youtube.com/embed/5WZl3MMT0Eg?start=120");
    assert.deepEqual(res, {
      videoId: "5WZl3MMT0Eg",
      startTime: 120,
    });

    const compound = parseYoutubeUrl("https://www.youtube.com/watch?v=5WZl3MMT0Eg&t=1h2m3s");
    assert.deepEqual(compound, {
      videoId: "5WZl3MMT0Eg",
      startTime: 3600 + 120 + 3,
    });
  });

  it("returns null for invalid or non-YouTube URLs", () => {
    assert.equal(parseYoutubeUrl("not-a-valid-url"), null);
    assert.equal(parseYoutubeUrl("https://example.com/watch?v=123"), null);
    assert.equal(parseYoutubeUrl("https://www.youtube.com/feed/subscriptions"), null);
    assert.equal(parseYoutubeUrl(""), null);
    assert.equal(parseYoutubeUrl(null), null);
  });

  it("normalizes question titles reliably (punctuation, case, whitespace)", () => {
    assert.equal(normalizeTitle("  Two Sum  "), "two sum");
    assert.equal(normalizeTitle("Reverse Linked-List!"), "reverse linkedlist");
    assert.equal(normalizeTitle("Best Time to Buy and Sell Stock..."), "best time to buy and sell stock");
    assert.equal(normalizeTitle("Merge   Two   Sorted Lists"), "merge two sorted lists");
  });
});

