import { MAX_GUESSES, WORD_LENGTH } from "@/lib/config";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main>
        <h1 className={styles.title}>Ordgæt</h1>
        <p className={styles.tagline}>
          Gæt ordet på {WORD_LENGTH} bogstaver. Du har {MAX_GUESSES} forsøg.
        </p>
        <p className={styles.tagline}>Spillet er på vej.</p>
      </main>
    </div>
  );
}
