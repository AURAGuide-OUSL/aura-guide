import React, { useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/ThemeContext";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function toISODateLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseISODate(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatDisplay(value: string): string {
  const d = parseISODate(value);
  if (!d) return "Select date";
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function compareISO(a: string, b: string): number {
  return a.localeCompare(b);
}

function buildMonthGrid(year: number, month: number): (number | null)[] {
  const first = new Date(year, month, 1);
  let offset = first.getDay() - 1;
  if (offset < 0) offset = 6;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array.from({ length: offset }, () => null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function DatePickerField({
  label,
  value,
  onChange,
  minimumDate,
  maximumDate,
  placeholder = "Select date",
}: {
  label: string;
  value: string;
  onChange: (isoDate: string) => void;
  minimumDate?: string;
  maximumDate?: string;
  placeholder?: string;
}) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);

  const selected = parseISODate(value);
  const initialView = selected ?? new Date();
  const [viewYear, setViewYear] = useState(initialView.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialView.getMonth());

  const styles = useMemo(
    () =>
      StyleSheet.create({
        group: { gap: 8 },
        label: { fontSize: 14, fontWeight: "700", color: colors.text },
        trigger: {
          height: 52,
          borderRadius: 16,
          backgroundColor: colors.surfaceMuted,
          borderWidth: 1,
          borderColor: colors.border,
          paddingHorizontal: 14,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        },
        triggerText: { flex: 1, fontSize: 15, fontWeight: "600", color: colors.text },
        triggerPlaceholder: { color: colors.muted, fontWeight: "500" },
        backdrop: {
          flex: 1,
          backgroundColor: "rgba(15, 23, 42, 0.55)",
          justifyContent: "center",
          padding: 20,
        },
        sheet: {
          borderRadius: 20,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 16,
          maxWidth: 400,
          width: "100%",
          alignSelf: "center",
        },
        sheetHeader: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        },
        sheetTitle: { fontSize: 17, fontWeight: "800", color: colors.text },
        navBtn: {
          width: 36,
          height: 36,
          borderRadius: 12,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.chipBlue,
        },
        weekdayRow: {
          flexDirection: "row",
          marginBottom: 6,
        },
        weekday: {
          flex: 1,
          textAlign: "center",
          fontSize: 11,
          fontWeight: "700",
          color: colors.muted,
        },
        grid: { flexDirection: "row", flexWrap: "wrap" },
        dayCell: {
          width: `${100 / 7}%` as any,
          aspectRatio: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: 2,
        },
        dayInner: {
          width: 36,
          height: 36,
          borderRadius: 12,
          alignItems: "center",
          justifyContent: "center",
        },
        dayText: { fontSize: 14, fontWeight: "700", color: colors.text },
        dayTextMuted: { color: colors.muted, opacity: 0.35 },
        dayTextSelected: { color: "#FFFFFF" },
        footer: {
          marginTop: 12,
          paddingTop: 12,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
          flexDirection: "row",
          justifyContent: "flex-end",
        },
        todayBtn: {
          paddingHorizontal: 14,
          paddingVertical: 8,
          borderRadius: 10,
          backgroundColor: colors.surfaceMuted,
        },
        todayBtnText: { fontSize: 13, fontWeight: "700", color: colors.primary },
      }),
    [colors],
  );

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
  const todayISO = toISODateLocal(new Date());
  const cells = buildMonthGrid(viewYear, viewMonth);

  const openPicker = () => {
    const base = parseISODate(value) ?? new Date();
    setViewYear(base.getFullYear());
    setViewMonth(base.getMonth());
    setOpen(true);
  };

  const shiftMonth = (delta: number) => {
    const d = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const pickDay = (day: number) => {
    const iso = toISODateLocal(new Date(viewYear, viewMonth, day));
    if (minimumDate && compareISO(iso, minimumDate) < 0) return;
    if (maximumDate && compareISO(iso, maximumDate) > 0) return;
    onChange(iso);
    setOpen(false);
  };

  const display = value ? formatDisplay(value) : placeholder;

  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        onPress={openPicker}
        style={({ pressed }) => [styles.trigger, pressed && { opacity: 0.85 }]}
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${display}`}
      >
        <Ionicons name="calendar-outline" size={20} color={colors.primary} />
        <Text style={[styles.triggerText, !value && styles.triggerPlaceholder]} numberOfLines={1}>
          {display}
        </Text>
        <Ionicons name="chevron-down" size={16} color={colors.muted} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetHeader}>
              <Pressable onPress={() => shiftMonth(-1)} style={styles.navBtn} accessibilityLabel="Previous month">
                <Ionicons name="chevron-back" size={20} color={colors.primary} />
              </Pressable>
              <Text style={styles.sheetTitle}>{monthLabel}</Text>
              <Pressable onPress={() => shiftMonth(1)} style={styles.navBtn} accessibilityLabel="Next month">
                <Ionicons name="chevron-forward" size={20} color={colors.primary} />
              </Pressable>
            </View>

            <View style={styles.weekdayRow}>
              {WEEKDAYS.map((wd) => (
                <Text key={wd} style={styles.weekday}>
                  {wd}
                </Text>
              ))}
            </View>

            <View style={styles.grid}>
              {cells.map((day, idx) => {
                if (day == null) {
                  return <View key={`empty-${idx}`} style={styles.dayCell} />;
                }
                const iso = toISODateLocal(new Date(viewYear, viewMonth, day));
                const disabled = Boolean(
                  (minimumDate && compareISO(iso, minimumDate) < 0) ||
                    (maximumDate && compareISO(iso, maximumDate) > 0),
                );
                const isSelected = value === iso;
                const isToday = todayISO === iso;

                return (
                  <Pressable
                    key={iso}
                    style={styles.dayCell}
                    disabled={disabled}
                    onPress={() => pickDay(day)}
                    accessibilityLabel={iso}
                  >
                    <View
                      style={[
                        styles.dayInner,
                        isSelected && { backgroundColor: colors.primary },
                        !isSelected && isToday && {
                          borderWidth: 2,
                          borderColor: colors.primary,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          disabled && styles.dayTextMuted,
                          isSelected && styles.dayTextSelected,
                        ]}
                      >
                        {day}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.footer}>
              <Pressable
                style={styles.todayBtn}
                onPress={() => {
                  if (minimumDate && compareISO(todayISO, minimumDate) < 0) return;
                  if (maximumDate && compareISO(todayISO, maximumDate) > 0) return;
                  onChange(todayISO);
                  setOpen(false);
                }}
              >
                <Text style={styles.todayBtnText}>Today</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

export { toISODateLocal, parseISODate };
