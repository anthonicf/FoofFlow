import { Injectable, computed, signal } from '@angular/core';
import { ACHIEVEMENTS, LEVELS, MISSIONS, XP_RULES } from '../data/data';
import type { Achievement, Level, Mission, XpEvent } from '../models/models';

@Injectable({ providedIn: 'root' })
export class GamificationService {
  private readonly xpSignal = signal(0);
  private readonly eventsSignal = signal<XpEvent[]>([]);
  private readonly missionsSignal = signal<Mission[]>(MISSIONS.map((m) => ({ ...m })));
  private readonly achievementsSignal = signal<Achievement[]>(
    ACHIEVEMENTS.map((a) => ({ ...a })),
  );
  private readonly discoveredSignal = signal<string[]>([]);

  readonly xp = this.xpSignal.asReadonly();
  readonly events = this.eventsSignal.asReadonly();
  readonly missions = this.missionsSignal.asReadonly();
  readonly achievements = this.achievementsSignal.asReadonly();
  readonly discoveredRestaurantIds = this.discoveredSignal.asReadonly();

  readonly levelInfo = computed(() => this.levelFromXp(this.xp()));

  constructor() {
    this.checkLevelAchievements();
  }

  addXp(amount: number, reason: string): void {
    this.xpSignal.update((xp) => xp + amount);
    this.eventsSignal.update((events) =>
      [{ amount, reason, date: new Date().toISOString() }, ...events].slice(0, 30),
    );
    this.checkLevelAchievements();
  }

  levelFromXp(xp: number): { level: Level; next: Level | null; currentMin: number; pct: number } {
    let current: Level = LEVELS[0];
    let next: Level | null = LEVELS[1];
    for (let i = 0; i < LEVELS.length; i++) {
      if (xp >= LEVELS[i].minXp) {
        current = LEVELS[i];
        next = LEVELS[i + 1] ?? null;
      }
    }
    const currentMin = current.minXp;
    const pct = next ? Math.min(100, ((xp - currentMin) / (next.minXp - currentMin)) * 100) : 100;
    return { level: current, next, currentMin, pct };
  }

  /**
   * Registra un restaurante descubierto (primera visita a su menú).
   * Otorga XP una sola vez por restaurante.
   */
  markDiscovered(restaurantId: string): void {
    if (this.discoveredSignal().includes(restaurantId)) return;
    this.discoveredSignal.update((ids) => [...ids, restaurantId]);
    this.addXp(XP_RULES.restaurantDiscovered, 'Restaurante descubierto');
    this.incrementMissionProgress('discover');
    this.unlockAchievement('a2');
  }

  /** Mapea claves de progreso a misiones concretas. */
  incrementMissionProgress(key: 'discover' | 'order' | 'rate' | 'newCategory'): void {
    const map: Record<string, string[]> = {
      discover: ['m1'],
      order: ['m2', 'm5'],
      rate: ['m3'],
      newCategory: ['m4'],
    };
    const ids = map[key] ?? [];
    this.missionsSignal.update((missions) =>
      missions.map((m) => {
        if (!ids.includes(m.id) || m.claimed) return m;
        const progress = Math.min(m.target, m.progress + 1);
        return { ...m, progress, completed: progress >= m.target };
      }),
    );
  }

  claimMission(missionId: string): void {
    const mission = this.missionsSignal().find((m) => m.id === missionId);
    if (!mission || !mission.completed || mission.claimed) return;
    this.missionsSignal.update((missions) =>
      missions.map((m) => (m.id === missionId ? { ...m, claimed: true } : m)),
    );
    this.addXp(mission.reward, `Misión completada: ${mission.title}`);
  }

  unlockAchievement(achievementId: string | undefined): void {
    if (!achievementId) return;
    this.achievementsSignal.update((achievements) =>
      achievements.map((a) =>
        a.id === achievementId && a.unlockedAt === null
          ? { ...a, unlockedAt: new Date().toISOString() }
          : a,
      ),
    );
  }

  completeSurprise(): void {
    this.addXp(XP_RULES.surpriseUsed, 'Usaste Sorpréndeme');
    this.unlockAchievement('a6');
  }

  completeGroupAchievement(): void {
    this.unlockAchievement('a5');
  }

  /** Desbloquea logros basados en nivel. */
  private checkLevelAchievements(): void {
    if (this.levelInfo().level.number >= 3) {
      this.unlockAchievement('a4');
    }
  }
}