import { prisma } from "@/server/db/prisma";
import { errors } from "@/lib/errors";
import { TRACK_SLUGS, type TrackSlug } from "@/config/tracks";

export const trackService = {
  listTracks() {
    return prisma.track.findMany({ orderBy: { order: "asc" } });
  },

  async getBySlug(slug: string) {
    const track = await prisma.track.findUnique({ where: { slug } });
    if (!track) {
      throw errors.notFound("مسیر یادگیری");
    }
    return track;
  },

  async ensureUserTrackProgress(userId: string, trackId: string) {
    return prisma.userTrackProgress.upsert({
      where: { userId_trackId: { userId, trackId } },
      update: {},
      create: { userId, trackId, currentDayNumber: 1 },
    });
  },

  async getOrCreateActiveTrack(userId: string) {
    const profile = await prisma.profile.findUniqueOrThrow({
      where: { userId },
      include: { activeTrack: true },
    });
    if (profile.activeTrack) {
      await this.ensureUserTrackProgress(userId, profile.activeTrack.id);
      return profile.activeTrack;
    }
    const devops = await prisma.track.findUniqueOrThrow({ where: { slug: TRACK_SLUGS.DEVOPS_SRE } });
    await prisma.profile.update({
      where: { userId },
      data: { activeTrackId: devops.id },
    });
    await this.ensureUserTrackProgress(userId, devops.id);
    return devops;
  },

  async setActiveTrack(userId: string, trackSlug: TrackSlug | string) {
    const track = await this.getBySlug(trackSlug);
    const progress = await this.ensureUserTrackProgress(userId, track.id);
    await prisma.profile.update({
      where: { userId },
      data: {
        activeTrackId: track.id,
        currentDayNumber: progress.currentDayNumber,
        xp: progress.xp,
        streak: progress.streak,
        lastStudyDate: progress.lastStudyDate,
      },
    });
    return track;
  },

  async getTrackProgress(userId: string, trackId: string) {
    return this.ensureUserTrackProgress(userId, trackId);
  },

  async syncProfileMirror(userId: string, trackId: string) {
    const profile = await prisma.profile.findUniqueOrThrow({ where: { userId } });
    if (profile.activeTrackId !== trackId) return;
    const progress = await this.ensureUserTrackProgress(userId, trackId);
    await prisma.profile.update({
      where: { userId },
      data: {
        currentDayNumber: progress.currentDayNumber,
        xp: progress.xp,
        streak: progress.streak,
        lastStudyDate: progress.lastStudyDate,
      },
    });
  },
};
