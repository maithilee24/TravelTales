import { AppProps } from "next/app";
import { ExperienceProvider } from "@/context/experienceContext";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ExperienceProvider>
      <Component {...pageProps} />
    </ExperienceProvider>
  );
}

export default MyApp;

