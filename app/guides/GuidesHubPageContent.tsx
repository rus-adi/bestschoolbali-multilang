import GuidesHubContent from "../../components/GuidesHubContent";

export default function GuidesHubPageContent({ locale = "en" }: { locale?: string }) {
  return <GuidesHubContent locale={locale} />;
}
