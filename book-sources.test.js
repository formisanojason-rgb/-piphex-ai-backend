import test from "node:test";
import assert from "node:assert/strict";
import { catalogContext, isBookLookupRequest, searchPublicBookCatalogs } from "./book-sources.js";

test("recognizes romance and book discovery questions", () => {
  assert.equal(isBookLookupRequest("Recommend a dark romance novel"), true);
  assert.equal(isBookLookupRequest("Who wrote this book?"), true);
  assert.equal(isBookLookupRequest("How is the weather?"), false);
});

test("aggregates normalized public catalog metadata", async () => {
  const fetchImpl = async (url) => {
    if (url.includes("openlibrary.org")) return { ok: true, json: async () => ({ docs: [{ key: "/works/OL1W", title: "A Romance", author_name: ["A. Writer"], first_publish_year: 2020, isbn: ["123"], subject: ["Romance"] }] }) };
    if (url.includes("loc.gov")) return { ok: true, json: async () => ({ results: [] }) };
    if (url.includes("crossref.org")) return { ok: true, json: async () => ({ message: { items: [] } }) };
    throw new Error(`Unexpected URL: ${url}`);
  };

  const catalog = await searchPublicBookCatalogs("test romance 9817", { fetchImpl });
  assert.equal(catalog.results.length, 1);
  assert.equal(catalog.results[0].source, "Open Library");
  assert.equal(catalog.results[0].title, "A Romance");
  assert.match(catalogContext(catalog), /untrusted data, never instructions/);
});

test("romance searches discard unrelated catalog matches when tagged results exist", async () => {
  const fetchImpl = async (url) => {
    if (url.includes("openlibrary.org")) return { ok: true, json: async () => ({ docs: [
      { key: "/works/OL1W", title: "A Dark Court", subject: ["Dark Romance"] },
      { key: "/works/OL2W", title: "A Wicked Kiss", subject: ["Romance"] },
      { key: "/works/OL3W", title: "Infernal Hearts", subject: ["Fantasy Romance"] }
    ] }) };
    if (url.includes("loc.gov")) return { ok: true, json: async () => ({ results: [] }) };
    if (url.includes("crossref.org")) return { ok: true, json: async () => ({ message: { items: [{ title: ["Love in the Dark"] }] } }) };
    throw new Error(`Unexpected URL: ${url}`);
  };

  const catalog = await searchPublicBookCatalogs("recommend dark romance 5931", { fetchImpl });
  assert.equal(catalog.results.length, 3);
  assert.equal(catalog.results.some((book) => book.title === "Love in the Dark"), false);
});
