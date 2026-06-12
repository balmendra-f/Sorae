import Screen from "@/components/common/Screen";
import {
  ActiveContextCard,
  BehaviorSignalsGrid,
  ContextSnapshotCards,
  ContinueReflectionCard,
  EmptyContextState,
  MemoryInsightsList,
  PersonalTimelineCard,
  RecentContextList,
  RiskStateCard,
  type RecentContextItem,
  WeeklySummaryCard,
} from "@/components/sorae/ContextPanels";
import { useSoraeAI } from "@/providers/AiProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function ContextScreen() {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const {
    memoryStatus,
    activeContext,
    behaviorSignals,
    userPatterns,
    memoryInsights,
    recentSummary,
    followUpFocus,
    riskState,
    hasUserShared,
    onboarding,
    latestCheckIn,
    weeklySummary,
    timelineItems,
    isLoading,
    isGeneratingWeeklySummary,
    refreshWeeklySummary,
  } = useSoraeAI();
  const brandColor = isDarkMode ? "#D8CEF5" : "#5E5082";
  const mutedIconColor = isDarkMode ? "#AFA7C1" : "#4A4A4A";
  const isEmpty = memoryStatus === "empty" || !hasUserShared;
  const statusLabel =
    memoryStatus === "active"
      ? t("sorae_status_active")
      : memoryStatus === "forming"
        ? t("sorae_status_forming")
        : t("sorae_status_listening");
  const recentContext: RecentContextItem[] = [
    {
      icon: "trending-up-outline",
      title: t("sorae_recent_summary_label"),
      body: recentSummary,
      meta: isLoading ? t("loading") : t("sorae_now"),
    },
    {
      icon: "time-outline",
      title: t("sorae_next_focus_label"),
      body: followUpFocus,
      meta: t("sorae_today"),
    },
  ];
  const goToChat = () => router.push("/(app)/(tabs)");

  return (
    <Screen tabbed>
      <View className="flex-1 bg-[#FAFAFA] dark:bg-[#151219]">
        <View className="flex-row items-center justify-between px-6 py-4">
          <View className="flex-row items-center gap-3">
            <Ionicons
              name="share-social-outline"
              size={26}
              color={brandColor}
              style={{ transform: [{ rotate: "270deg" }] }}
            />
            <View>
              <Text
                className="text-3xl text-[#5E5082] dark:text-[#D8CEF5]"
                style={{ fontFamily: "serif" }}
              >
                Sorae
              </Text>
              <Text className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-[#A39EBC] dark:text-[#AFA7C1]">
                {statusLabel}
              </Text>
            </View>
          </View>
          <Pressable>
            <Ionicons
              name="ellipsis-vertical"
              size={24}
              color={mutedIconColor}
            />
          </Pressable>
        </View>

        <ScrollView
          className="flex-1 px-5"
          contentContainerStyle={{ paddingBottom: 28 }}
          showsVerticalScrollIndicator={false}
        >
          {isEmpty ? (
            <EmptyContextState
              brandColor={brandColor}
              onStartChat={goToChat}
            />
          ) : (
            <>
              <WeeklySummaryCard
                brandColor={brandColor}
                weeklySummary={weeklySummary}
                isGenerating={isGeneratingWeeklySummary}
                onRefresh={() => void refreshWeeklySummary()}
              />

              <ContextSnapshotCards
                brandColor={brandColor}
                latestCheckIn={latestCheckIn}
                onboarding={onboarding}
              />

              <PersonalTimelineCard
                brandColor={brandColor}
                timelineItems={timelineItems}
              />

              <ActiveContextCard
                brandColor={brandColor}
                activeContext={activeContext}
                userPatterns={userPatterns}
              />

              <MemoryInsightsList
                brandColor={brandColor}
                memoryInsights={memoryInsights}
              />

              <BehaviorSignalsGrid
                brandColor={brandColor}
                behaviorSignals={behaviorSignals}
              />

              <RecentContextList
                brandColor={brandColor}
                items={recentContext}
              />

              <RiskStateCard riskState={riskState} />

              <ContinueReflectionCard
                brandColor={brandColor}
                followUpFocus={followUpFocus}
                onStartChat={goToChat}
              />
            </>
          )}
        </ScrollView>
      </View>
    </Screen>
  );
}
