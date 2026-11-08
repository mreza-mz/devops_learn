import { curriculumRepository } from "@/repositories";

export const curriculumService = {
  getDay(trackId: string, dayNumber: number) {
    return curriculumRepository.getDay(trackId, dayNumber);
  },
  listTopics(trackId?: string) {
    return curriculumRepository.listTopics(trackId);
  },
};
