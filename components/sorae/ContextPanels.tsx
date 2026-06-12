import type {
  ActiveContext,
  BehaviorSignal,
  DailyCheckIn,
  InsightKind,
  MemoryInsight,
  OnboardingPreferences,
  PersonalTimelineItem,
  RiskState,
  TimelineCategory,
  WeeklySummary,
} from "@/types/sorae";
import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

type IconName = ComponentProps<typeof Ionicons>["name"];

export type RecentContextItem = {
  icon: IconName;
  title: string;
  body: string;
  meta: string;
};

const insightIconByKind: Record<InsightKind, IconName> = {
  fact: "document-text-outline",
  emotion: "heart-outline",
  theme: "sparkles-outline",
  hypothesis: "bulb-outline",
};

const insightLabelByKind: Record<InsightKind, string> = {
  fact: "sorae_insight_fact",
  emotion: "sorae_insight_emotion",
  theme: "sorae_insight_theme",
  hypothesis: "sorae_insight_hypothesis",
};

export const confidenceLabel = (confidence?: number) => {
  const value = confidence ?? 0;

  if (value >= 0.75) return "sorae_confidence_high";
  if (value >= 0.45) return "sorae_confidence_medium";
  return "sorae_confidence_low";
};

export const toneLabel = (tone?: string) => {
  if (tone === "direct") return "sorae_tone_direct";
  if (tone === "reflective") return "sorae_tone_reflective";
  if (tone === "practical") return "sorae_tone_practical";
  return "sorae_tone_gentle";
};

const moodLabel = (mood?: string) => {
  if (mood === "Calm") return "sorae_mood_calm";
  if (mood === "Tired") return "sorae_mood_tired";
  if (mood === "Anxious") return "sorae_mood_anxious";
  if (mood === "Confused") return "sorae_mood_confused";
  if (mood === "Good") return "sorae_mood_good";
  return mood ?? "";
};

const timelineIconByCategory: Record<TimelineCategory, IconName> = {
  reflection: "book-outline",
  decision: "checkmark-circle-outline",
  mood: "pulse-outline",
  theme: "repeat-outline",
};

const timelineLabelByCategory: Record<TimelineCategory, string> = {
  reflection: "sorae_timeline_reflection",
  decision: "sorae_timeline_decision",
  mood: "sorae_timeline_mood",
  theme: "sorae_timeline_theme",
};

const formatTimelineDate = (date: string, language: string) => {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "";

  return new Intl.DateTimeFormat(language, {
    day: "numeric",
    month: "short",
  }).format(parsedDate);
};

type StartChatProps = {
  brandColor: string;
  onStartChat: () => void;
};

export const EmptyContextState = ({
  brandColor,
  onStartChat,
}: StartChatProps) => {
  const { t } = useTranslation();

  return (
    <View className="mt-8 rounded-[28px] border border-[#E8E5EE] bg-white p-6 shadow-sm dark:border-[#31293D] dark:bg-[#201A29]">
    <View className="mb-5 h-12 w-12 items-center justify-center rounded-2xl bg-[#F1EFF7] dark:bg-[#2A2234]">
      <Ionicons name="ear-outline" size={24} color={brandColor} />
    </View>
    <Text
      className="mb-3 text-2xl text-[#2E2A36] dark:text-[#F4F0FA]"
      style={{ fontFamily: "serif" }}
    >
      {t("sorae_context_empty_title")}
    </Text>
    <Text
      className="mb-5 text-base leading-7 text-gray-700 dark:text-[#D8D1E6]"
      style={{ fontFamily: "serif" }}
    >
      {t("sorae_context_empty_body")}
    </Text>
    <Pressable
      className="self-start rounded-full bg-[#5E5082] px-5 py-3 dark:bg-[#8F7DCC]"
      onPress={onStartChat}
    >
      <Text className="text-[13px] font-bold tracking-wider text-white">
        {t("sorae_talk_with_sorae")}
      </Text>
    </Pressable>
  </View>
  );
};

type WeeklySummaryCardProps = {
  brandColor: string;
  weeklySummary: WeeklySummary | null;
  isGenerating: boolean;
  onRefresh: () => void;
};

export const WeeklySummaryCard = ({
  brandColor,
  weeklySummary,
  isGenerating,
  onRefresh,
}: WeeklySummaryCardProps) => {
  const { t } = useTranslation();

  return (
    <View className="mb-5 rounded-[28px] border border-[#E8E5EE] bg-white p-5 shadow-sm dark:border-[#31293D] dark:bg-[#201A29]">
    <View className="mb-4 flex-row items-center justify-between">
      <View className="flex-row items-center">
        <View className="mr-3 h-10 w-10 items-center justify-center rounded-2xl bg-[#F1EFF7] dark:bg-[#2A2234]">
          <Ionicons
            name="calendar-clear-outline"
            size={20}
            color={brandColor}
          />
        </View>
        <View>
          <Text className="text-[11px] font-bold uppercase tracking-widest text-[#9B96AE] dark:text-[#AFA7C1]">
            {t("sorae_weekly_summary_label")}
          </Text>
          <Text
            className="text-xl text-[#2E2A36] dark:text-[#F4F0FA]"
            style={{ fontFamily: "serif" }}
          >
            {weeklySummary?.headline ?? t("sorae_weekly_not_generated")}
          </Text>
        </View>
      </View>
      <Pressable
        className="h-10 w-10 items-center justify-center rounded-2xl bg-[#F4F3F6] dark:bg-[#2A2234]"
        disabled={isGenerating}
        onPress={onRefresh}
      >
        {isGenerating ? (
          <ActivityIndicator size="small" color={brandColor} />
        ) : (
          <Ionicons name="refresh-outline" size={18} color={brandColor} />
        )}
      </Pressable>
    </View>

    <Text
      className="mb-4 text-base leading-7 text-gray-800 dark:text-[#F4F0FA]"
      style={{ fontFamily: "serif" }}
    >
      {weeklySummary?.emotionalTone ??
        t("sorae_weekly_empty_body")}
    </Text>

    {weeklySummary && (
      <>
        <View className="mb-4 flex-row flex-wrap gap-2">
          {weeklySummary.themes.map((theme) => (
            <View
              key={theme}
              className="rounded-full border border-[#DAD6E4] px-4 py-2 dark:border-[#4B415C]"
            >
              <Text className="text-[12px] font-bold tracking-wider text-[#4A4A4A] dark:text-[#D8CEF5]">
                {theme}
              </Text>
            </View>
          ))}
        </View>
        <Text className="text-[13px] font-semibold leading-6 text-[#6B647A] dark:text-[#C7BDE0]">
          {weeklySummary.suggestedRitual}
        </Text>
      </>
    )}
  </View>
  );
};

type ContextSnapshotCardsProps = {
  brandColor: string;
  latestCheckIn: DailyCheckIn | null;
  onboarding: OnboardingPreferences | null;
};

export const ContextSnapshotCards = ({
  brandColor,
  latestCheckIn,
  onboarding,
}: ContextSnapshotCardsProps) => {
  const { t } = useTranslation();

  return (
    <View className="mb-5 flex-row gap-3">
    <View className="min-h-[112px] flex-1 rounded-3xl border border-[#E8E5EE] bg-white p-4 shadow-sm dark:border-[#31293D] dark:bg-[#201A29]">
      <Ionicons name="battery-half-outline" size={20} color={brandColor} />
      <Text className="mt-3 text-[10px] font-bold uppercase tracking-widest text-[#9B96AE] dark:text-[#AFA7C1]">
        {t("sorae_check_in_label")}
      </Text>
      <Text
        className="mt-1 text-lg text-[#2E2A36] dark:text-[#F4F0FA]"
        style={{ fontFamily: "serif" }}
      >
        {latestCheckIn
          ? `${t(moodLabel(latestCheckIn.mood))} · ${latestCheckIn.energy}/5`
          : t("sorae_pending")}
      </Text>
    </View>
    <View className="min-h-[112px] flex-1 rounded-3xl border border-[#E8E5EE] bg-white p-4 shadow-sm dark:border-[#31293D] dark:bg-[#201A29]">
      <Ionicons name="options-outline" size={20} color={brandColor} />
      <Text className="mt-3 text-[10px] font-bold uppercase tracking-widest text-[#9B96AE] dark:text-[#AFA7C1]">
        {t("sorae_tone_label")}
      </Text>
      <Text
        className="mt-1 text-lg text-[#2E2A36] dark:text-[#F4F0FA]"
        style={{ fontFamily: "serif" }}
      >
        {t(toneLabel(onboarding?.tone))}
      </Text>
    </View>
  </View>
  );
};

type PersonalTimelineCardProps = {
  brandColor: string;
  timelineItems: PersonalTimelineItem[];
};

export const PersonalTimelineCard = ({
  brandColor,
  timelineItems,
}: PersonalTimelineCardProps) => {
  const { t, i18n } = useTranslation();

  if (timelineItems.length === 0) return null;

  return (
    <View className="mb-5 rounded-[28px] border border-[#E8E5EE] bg-white p-5 shadow-sm dark:border-[#31293D] dark:bg-[#201A29]">
      <View className="mb-4 flex-row items-start">
        <View className="mr-3 h-10 w-10 items-center justify-center rounded-2xl bg-[#F1EFF7] dark:bg-[#2A2234]">
          <Ionicons name="trail-sign-outline" size={20} color={brandColor} />
        </View>
        <View className="min-w-0 flex-1">
          <Text className="text-[11px] font-bold uppercase tracking-widest text-[#9B96AE] dark:text-[#AFA7C1]">
            {t("sorae_timeline_label")}
          </Text>
          <Text
            className="text-xl leading-6 text-[#2E2A36] dark:text-[#F4F0FA]"
            style={{ fontFamily: "serif" }}
          >
            {t("sorae_timeline_title")}
          </Text>
        </View>
      </View>

      <View>
        {timelineItems.slice(0, 6).map((item, index) => {
          const isLast = index === Math.min(timelineItems.length, 6) - 1;
          const title =
            item.category === "mood" && item.mood
              ? t(moodLabel(item.mood))
              : item.title;
          const body =
            item.body ||
            (item.energy
              ? t("sorae_timeline_energy", { value: item.energy })
              : "");
          const dateLabel = formatTimelineDate(item.date, i18n.language);

          return (
            <View key={item.id} className="flex-row">
              <View className="mr-3 items-center">
                <View className="h-9 w-9 items-center justify-center rounded-2xl bg-[#F6F5F9] dark:bg-[#2A2234]">
                  <Ionicons
                    name={timelineIconByCategory[item.category]}
                    size={17}
                    color={brandColor}
                  />
                </View>
                {!isLast && (
                  <View className="my-2 w-px flex-1 bg-[#E2DFEA] dark:bg-[#4B415C]" />
                )}
              </View>
              <View className={`min-w-0 flex-1 ${isLast ? "" : "pb-5"}`}>
                <View className="mb-1 flex-row flex-wrap items-center gap-2">
                  <View className="rounded-full bg-[#F4F3F6] px-3 py-1 dark:bg-[#2A2234]">
                    <Text className="text-[10px] font-bold uppercase tracking-wider text-[#5E5082] dark:text-[#D8CEF5]">
                      {t(timelineLabelByCategory[item.category])}
                    </Text>
                  </View>
                  {dateLabel ? (
                    <Text className="text-[10px] font-bold uppercase tracking-widest text-[#A39EBC] dark:text-[#AFA7C1]">
                      {dateLabel}
                    </Text>
                  ) : null}
                </View>
                <Text className="text-base font-bold leading-5 text-[#2E2A36] dark:text-[#F4F0FA]">
                  {title}
                </Text>
                {body ? (
                  <Text
                    className="mt-1 text-[14px] leading-6 text-gray-700 dark:text-[#D8D1E6]"
                    style={{ fontFamily: "serif" }}
                  >
                    {body}
                  </Text>
                ) : null}
                {item.tags.length > 0 && (
                  <View className="mt-3 flex-row flex-wrap gap-2">
                    {item.tags.slice(0, 3).map((tag) => (
                      <View
                        key={tag}
                        className="max-w-full rounded-[18px] border border-[#DAD6E4] px-3 py-1.5 dark:border-[#4B415C]"
                      >
                        <Text className="text-[11px] font-bold leading-4 text-[#6B647A] dark:text-[#C7BDE0]">
                          {tag}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

type ActiveContextCardProps = {
  brandColor: string;
  activeContext: ActiveContext;
  userPatterns: string[];
};

export const ActiveContextCard = ({
  brandColor,
  activeContext,
  userPatterns,
}: ActiveContextCardProps) => {
  const { t } = useTranslation();

  return (
    <View className="mb-5 rounded-[28px] border border-[#E8E5EE] bg-white p-5 shadow-sm dark:border-[#31293D] dark:bg-[#201A29]">
    <View className="mb-4 flex-row items-start justify-between gap-3">
      <View className="min-w-0 flex-1 flex-row items-center">
        <View className="mr-3 h-10 w-10 items-center justify-center rounded-2xl bg-[#F1EFF7] dark:bg-[#2A2234]">
          <Ionicons name="layers-outline" size={20} color={brandColor} />
        </View>
        <View className="min-w-0 flex-1">
          <Text className="text-[11px] font-bold uppercase tracking-widest text-[#9B96AE] dark:text-[#AFA7C1]">
            {t("sorae_active_context_label")}
          </Text>
          <Text
            className="text-xl leading-6 text-[#2E2A36] dark:text-[#F4F0FA]"
            style={{ fontFamily: "serif" }}
          >
            {activeContext.title}
          </Text>
        </View>
      </View>
      <View className="max-w-[34%] rounded-full bg-[#F4F3F6] px-3 py-1.5 dark:bg-[#2A2234]">
        <Text className="text-[10px] font-bold uppercase tracking-wider text-[#5E5082] dark:text-[#D8CEF5]">
          {activeContext.timeframe}
        </Text>
      </View>
    </View>

    <Text
      className="mb-5 text-base leading-7 text-gray-800 dark:text-[#F4F0FA]"
      style={{ fontFamily: "serif" }}
    >
      {activeContext.summary}
    </Text>

    {userPatterns.length > 0 && (
      <View className="flex-row flex-wrap gap-2">
        {userPatterns.slice(0, 4).map((tag) => (
          <View
            key={tag}
            className="max-w-full rounded-[22px] border border-[#DAD6E4] px-4 py-2 dark:border-[#4B415C]"
          >
            <Text className="text-[12px] font-bold leading-4 tracking-wider text-[#4A4A4A] dark:text-[#D8CEF5]">
              {tag}
            </Text>
          </View>
        ))}
      </View>
    )}
  </View>
  );
};

type MemoryInsightsListProps = {
  brandColor: string;
  memoryInsights: MemoryInsight[];
};

export const MemoryInsightsList = ({
  brandColor,
  memoryInsights,
}: MemoryInsightsListProps) => {
  const { t } = useTranslation();

  if (memoryInsights.length === 0) return null;

  return (
    <View className="mb-5">
      <Text className="mb-3 px-1 text-[12px] font-bold uppercase tracking-widest text-[#6B647A] dark:text-[#C7BDE0]">
        {t("sorae_understanding_label")}
      </Text>
      {memoryInsights.map((insight) => (
        <View
          key={`${insight.kind}-${insight.label}`}
          className="mb-3 flex-row rounded-3xl border border-gray-100 bg-white p-4 shadow-sm dark:border-[#31293D] dark:bg-[#201A29]"
        >
          <View className="mr-4 h-10 w-10 items-center justify-center rounded-2xl bg-[#F6F5F9] dark:bg-[#2A2234]">
            <Ionicons
              name={insightIconByKind[insight.kind]}
              size={19}
              color={brandColor}
            />
          </View>
          <View className="flex-1">
            <View className="mb-1 flex-row items-center justify-between gap-3">
              <Text className="flex-1 text-base font-bold text-[#2E2A36] dark:text-[#F4F0FA]">
                {insight.label}
              </Text>
              <Text className="text-[10px] font-bold uppercase tracking-widest text-[#A39EBC] dark:text-[#AFA7C1]">
                {t(insightLabelByKind[insight.kind])}
              </Text>
            </View>
            <Text
              className="text-[14px] leading-6 text-gray-700 dark:text-[#D8D1E6]"
              style={{ fontFamily: "serif" }}
            >
              {insight.detail}
            </Text>
            <Text className="mt-2 text-[10px] font-bold uppercase tracking-widest text-[#9B96AE] dark:text-[#AFA7C1]">
              {t("sorae_confidence_label", {
                value: t(confidenceLabel(insight.confidence)),
              })}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};

type BehaviorSignalsGridProps = {
  brandColor: string;
  behaviorSignals: BehaviorSignal[];
};

export const BehaviorSignalsGrid = ({
  brandColor,
  behaviorSignals,
}: BehaviorSignalsGridProps) => {
  const { t } = useTranslation();

  if (behaviorSignals.length === 0) return null;

  return (
    <View className="mb-5">
      <Text className="mb-3 px-1 text-[12px] font-bold uppercase tracking-widest text-[#6B647A] dark:text-[#C7BDE0]">
        {t("sorae_behavior_signals_label")}
      </Text>
      <View className="flex-row flex-wrap gap-3">
        {behaviorSignals.map((signal) => (
          <View
            key={signal.label}
            className="min-h-[112px] flex-1 basis-[30%] rounded-3xl border border-[#E8E5EE] bg-white p-4 shadow-sm dark:border-[#31293D] dark:bg-[#201A29]"
          >
            <View className="mb-3 h-9 w-9 items-center justify-center rounded-2xl bg-[#F1EFF7] dark:bg-[#2A2234]">
              <Ionicons name="pulse-outline" size={18} color={brandColor} />
            </View>
            <Text className="text-[10px] font-bold uppercase tracking-widest text-[#9B96AE] dark:text-[#AFA7C1]">
              {signal.label}
            </Text>
            <Text
              className="mt-1 text-lg text-[#2E2A36] dark:text-[#F4F0FA]"
              style={{ fontFamily: "serif" }}
            >
              {signal.value}
            </Text>
            <Text className="mt-2 text-[10px] font-bold uppercase tracking-widest text-[#9B96AE] dark:text-[#AFA7C1]">
              {t(confidenceLabel(signal.confidence))}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

type RecentContextListProps = {
  brandColor: string;
  items: RecentContextItem[];
};

export const RecentContextList = ({
  brandColor,
  items,
}: RecentContextListProps) => {
  const { t } = useTranslation();

  return (
    <View className="mb-5">
    <Text className="mb-3 px-1 text-[12px] font-bold uppercase tracking-widest text-[#6B647A] dark:text-[#C7BDE0]">
      {t("sorae_recent_memory_label")}
    </Text>
    {items.map((item, index) => (
      <View
        key={item.title}
        className="mb-3 flex-row rounded-3xl border border-gray-100 bg-white p-4 shadow-sm dark:border-[#31293D] dark:bg-[#201A29]"
      >
        <View className="mr-4 items-center">
          <View className="h-10 w-10 items-center justify-center rounded-2xl bg-[#F6F5F9] dark:bg-[#2A2234]">
            <Ionicons name={item.icon} size={19} color={brandColor} />
          </View>
          {index < items.length - 1 && (
            <View className="mt-2 h-10 w-px bg-[#E2DFEA] dark:bg-[#4B415C]" />
          )}
        </View>
        <View className="flex-1">
          <View className="mb-1 flex-row items-center justify-between gap-3">
            <Text className="flex-1 text-base font-bold text-[#2E2A36] dark:text-[#F4F0FA]">
              {item.title}
            </Text>
            <Text className="text-[10px] font-bold uppercase tracking-widest text-[#A39EBC] dark:text-[#AFA7C1]">
              {item.meta}
            </Text>
          </View>
          <Text
            className="text-[14px] leading-6 text-gray-700 dark:text-[#D8D1E6]"
            style={{ fontFamily: "serif" }}
          >
            {item.body}
          </Text>
        </View>
      </View>
    ))}
  </View>
  );
};

type RiskStateCardProps = {
  riskState: RiskState;
};

export const RiskStateCard = ({ riskState }: RiskStateCardProps) => {
  const { t } = useTranslation();

  if (riskState.level === "none") return null;

  return (
    <View className="mb-5 rounded-[28px] border border-[#F3D2A8] bg-[#FFF9F0] p-5 dark:border-[#5A4631] dark:bg-[#241D17]">
      <View className="mb-3 flex-row items-center">
        <Ionicons
          name="warning-outline"
          size={20}
          color={riskState.level === "urgent" ? "#B74444" : "#A86521"}
        />
        <Text className="ml-2 text-[12px] font-bold uppercase tracking-widest text-[#8A5A1F] dark:text-[#F0C58C]">
          {t("sorae_care_label")}
        </Text>
      </View>
      <Text
        className="mb-3 text-base leading-7 text-gray-800 dark:text-[#F4F0FA]"
        style={{ fontFamily: "serif" }}
      >
        {riskState.summary}
      </Text>
      {riskState.suggestedAction ? (
        <Text className="text-[13px] font-semibold leading-6 text-[#6B4A20] dark:text-[#F0C58C]">
          {riskState.suggestedAction}
        </Text>
      ) : null}
    </View>
  );
};

type ContinueReflectionCardProps = StartChatProps & {
  followUpFocus: string;
};

export const ContinueReflectionCard = ({
  brandColor,
  followUpFocus,
  onStartChat,
}: ContinueReflectionCardProps) => {
  const { t } = useTranslation();

  return (
    <View className="rounded-[28px] border border-[#E8E5EE] bg-[#F6F5F9] p-5 dark:border-[#31293D] dark:bg-[#201A29]">
    <View className="mb-3 flex-row items-center">
      <Ionicons
        name="chatbubble-ellipses-outline"
        size={20}
        color={brandColor}
      />
      <Text className="ml-2 text-[12px] font-bold uppercase tracking-widest text-[#6B647A] dark:text-[#C7BDE0]">
        {t("sorae_continue_label")}
      </Text>
    </View>
    <Text
      className="mb-4 text-base leading-7 text-gray-800 dark:text-[#F4F0FA]"
      style={{ fontFamily: "serif" }}
    >
      {followUpFocus}
    </Text>
    <Pressable
      className="self-start rounded-full bg-[#5E5082] px-5 py-3 dark:bg-[#8F7DCC]"
      onPress={onStartChat}
    >
      <Text className="text-[13px] font-bold tracking-wider text-white">
        {t("sorae_talk_with_sorae")}
      </Text>
    </Pressable>
  </View>
  );
};
