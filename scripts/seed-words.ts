/**
 * Import Danish five-letter words into the words table.
 *
 * Run with:  npm run seed
 *
 * Source: the Stavekontrolden.dk hunspell dictionary, built on data from
 * Det Danske Sprog- og Litteraturselskab and published under GPL/LGPL/MPL.
 *
 * Safe to run more than once: rows are upserted on the unique word column, so
 * re-running updates rather than duplicating.
 *
 * Only `word` and `no_repeats` are written. The `in_use` column is deliberately
 * left alone, so re-seeding never undoes curation done in the admin panel.
 * New words therefore arrive with in_use = false and must be opted in before
 * they can ever be the hidden answer.
 */
import { createClient } from "@supabase/supabase-js";
import { parseDictionary } from "../src/lib/words";

const SOURCE = "https://raw.githubusercontent.com/titoBouzout/Dictionaries/master/Danish.dic";
const BATCH_SIZE = 500;

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing Supabase credentials. Is .env.local present and filled in?");
  }
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  console.log(`Downloading ${SOURCE}`);
  const response = await fetch(SOURCE);
  if (!response.ok) throw new Error(`Download failed: HTTP ${response.status}`);
  const contents = await response.text();

  const words = parseDictionary(contents);
  const answers = words.filter((w) => w.noRepeats).length;
  console.log(`Parsed ${words.length} words — ${answers} of them usable as answers`);

  // Insert in batches; one 4,500-row request would time out.
  for (let i = 0; i < words.length; i += BATCH_SIZE) {
    const batch = words.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from("words").upsert(
      batch.map((w) => ({ word: w.word, no_repeats: w.noRepeats })),
      { onConflict: "word" },
    );
    if (error) throw new Error(`Insert failed at row ${i}: ${error.message}`);
    console.log(`  inserted ${Math.min(i + BATCH_SIZE, words.length)} / ${words.length}`);
  }

  const { count } = await supabase.from("words").select("*", { count: "exact", head: true });
  console.log(`\nDone. The words table now holds ${count} rows.`);
}

main().catch((error) => {
  console.error("\nSeed failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
