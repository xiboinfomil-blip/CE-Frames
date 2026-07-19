import styles from "./Login.module.css";

export default function BrandingPanel() {
  return (
    <aside className={styles.brandingPanel}>
      <div
        className={styles.brandingBg}
        aria-hidden="true"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1541348263662-e068662d82af?w=1200&q=80')",
        }}
      />
      <div className={styles.brandingOverlay} aria-hidden="true" />
      <div className={styles.checkeredPattern} aria-hidden="true" />
      <div className={styles.racingStripe} aria-hidden="true" />
      <div className={styles.bigNumber} aria-hidden="true">
        <span>01</span>
      </div>

      <div className={styles.brandingContent}>
        <div className={styles.logo}>
          <div className={styles.logoBadge}>
            <span className={styles.logoNumber}>OC</span>
          </div>
          <div className={styles.logoRacingBadge}>
            <span>01</span>
          </div>
        </div>

        <h1 className={styles.brandTitle}>OramaCreativ</h1>
        <p className={styles.brandTagline}>Admin Control Panel</p>
        <div className={styles.accentLine} />

        <div className={styles.statsCard}>
          <div className={styles.stat}>
            <span className={styles.statValue}>P1</span>
            <span className={styles.statLabel}>Position</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statValue}>340</span>
            <span className={styles.statLabel}>KM/H</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statValue}>1:28</span>
            <span className={styles.statLabel}>Lap</span>
          </div>
        </div>
      </div>
    </aside>
  );
}