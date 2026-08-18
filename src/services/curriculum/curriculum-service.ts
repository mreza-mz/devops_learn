import { curriculumRepository } from "@/repositories";

export const curriculumService = {
  getDay(dayNumber: number) {
    return curriculumRepository.getDay(dayNumber);
  },
  listTopics() {
    return curriculumRepository.listTopics();
  },
};
