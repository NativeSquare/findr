import { FirstSentenceListItem } from "@/components/app/first-sentences/first-sentence-list-item";
import { QuickRepliesInfoCard } from "@/components/app/first-sentences/quick-replies-info-card";
import { SentenceInputCard } from "@/components/app/first-sentences/sentence-input-card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { api } from "@convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { router } from "expo-router";
import { ArrowLeft, Plus } from "lucide-react-native";
import React, { useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";

const MAX_SENTENCES = 5;

export default function FirstSentences() {
  const user = useQuery(api.users.currentUser);
  const patchUser = useMutation(api.users.patch);
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const sentences = user?.firstSentences ?? [];
  const canAddMore = sentences.length < MAX_SENTENCES && !isAdding;

  const handleEdit = (index: number) => {
    setIsAdding(false);
    setEditingIndex(index);
  };

  const handleSaveEdit = async (text: string) => {
    if (!user?._id || editingIndex === null) return;

    const updatedSentences = [...sentences];
    updatedSentences[editingIndex] = text;

    await patchUser({
      id: user._id,
      data: { firstSentences: updatedSentences },
    });

    setEditingIndex(null);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
  };

  const handleDelete = (index: number) => {
    if (!user?._id) return;

    Alert.alert(
      "Delete Sentence",
      "Are you sure you want to delete this sentence?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const updatedSentences = sentences.filter((_, i) => i !== index);
            await patchUser({
              id: user._id,
              data: { firstSentences: updatedSentences },
            });
          },
        },
      ]
    );
  };

  const handleAddSentence = async (text: string) => {
    if (!user?._id) return;

    if (sentences.length >= MAX_SENTENCES) {
      Alert.alert("Error", `Maximum ${MAX_SENTENCES} sentences allowed`);
      return;
    }

    const updatedSentences = [...sentences, text];
    await patchUser({
      id: user._id,
      data: { firstSentences: updatedSentences },
    });

    setIsAdding(false);
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
  };

  const handleOpenAdd = () => {
    setEditingIndex(null);
    setIsAdding(true);
  };

  return (
    <View className="flex-1 bg-black">
      {/* Header */}
      <View className="border-b border-[#26272b] px-5 pb-4 pt-safe">
        <View className="flex-row items-center justify-between h-[44px]">
          <Pressable
            onPress={() => router.back()}
            className="size-6 items-center justify-center"
          >
            <Icon as={ArrowLeft} size={24} className="text-white" />
          </Pressable>
          <Text className="text-xl font-medium leading-[30px] text-white">
            First Sentence
          </Text>
          <Text className="text-sm font-medium leading-5 text-[#d1d1d6]">
            {sentences.length}/{MAX_SENTENCES}
          </Text>
        </View>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        contentContainerClassName="px-5 py-5 gap-5"
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-2xl self-center gap-5">
          <QuickRepliesInfoCard />

          <View className="flex-col gap-4">
            <Text className="text-base font-medium leading-6 text-white">
              Your Sentences
            </Text>

            <View className="flex-col gap-3">
              {sentences.map((sentence, index) =>
                editingIndex === index ? (
                  <SentenceInputCard
                    key={index}
                    title="Edit Sentence"
                    initialValue={sentence}
                    onSave={handleSaveEdit}
                    onCancel={handleCancelEdit}
                  />
                ) : (
                  <FirstSentenceListItem
                    key={index}
                    sentence={sentence}
                    onEdit={() => handleEdit(index)}
                    onDelete={() => handleDelete(index)}
                  />
                )
              )}
            </View>

            {isAdding && (
              <SentenceInputCard
                title="Add Sentence"
                onSave={handleAddSentence}
                onCancel={handleCancelAdd}
              />
            )}

            {canAddMore && (
              <Pressable
                onPress={handleOpenAdd}
                className="flex-row items-center gap-1 self-end"
              >
                <Icon as={Plus} size={18} className="text-[#e56400]" />
                <Text className="text-xs leading-[18px] text-[#e56400]">
                  Add sentence
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
