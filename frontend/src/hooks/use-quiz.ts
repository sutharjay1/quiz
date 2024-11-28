import { Quiz } from '@/types';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface QuizState {
	quiz: Quiz | null;
	setQuiz: (quiz: Quiz) => void;
}

export const useQuiz = create<QuizState>()(
	persist(
		(set) => ({
			quiz: null,
			setQuiz: (quiz: Quiz) => {
				set({ quiz });
			},
		}),
		{ name: 'project', storage: createJSONStorage(() => localStorage) }
	)
);
