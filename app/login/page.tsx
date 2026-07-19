import styles from "./Login.module.css";
import BrandingPanel from "@/components/login/BrandingPanel";
import LoginForm from "@/components/login/LoginForm";

export default function LoginPage() {
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600&family=Rajdhani:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <div className={styles.page}>
        <div className={styles.container}>
          <BrandingPanel />
          <LoginForm />
        </div>
      </div>
    </>
  );
}