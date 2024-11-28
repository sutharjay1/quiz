import { useParams } from 'react-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { errorToast, successToast } from '@/features/global/toast';
import { Question } from '@/types';

const getQuizQuestions = async (quizId: string) => {
	const response = await axios.get(
		`${import.meta.env.VITE_SERVER_URL}/api/quiz/questions/${quizId}`,
		{ withCredentials: true }
	);
	return response.data;
};

const submitQuizAnswers = async (
	quizId: string,
	answers: { questionId: string; answer: string }[]
) => {
	const response = await axios.post(
		`${import.meta.env.VITE_SERVER_URL}/api/quiz/questions/check`,
		{
			quizId,

			questionIds: answers.map((answer) => answer.questionId),
			answers: answers.map((answer) => answer.answer),
		},
		{ withCredentials: true }
	);
	return response.data;
};

const Submit = () => {
	const params = useParams();
	const quizId = params?.quizId as string;
	const [answers, setAnswers] = useState<{ [key: string]: string }>({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const {
		data: questions,
		isLoading,
		isError,
		error,
	} = useQuery({
		queryKey: ['questions', quizId],
		queryFn: () => getQuizQuestions(quizId),
		enabled: !!quizId,
	});

	const submitMutation = useMutation({
		mutationFn: async () => {
			if (!quizId || Object.keys(answers).length === 0) {
				throw new Error('Quiz ID or answers are missing');
			}

			const formattedAnswers = Object.keys(answers).map((questionId) => ({
				questionId,
				answer: answers[questionId],
			}));

			console.log(formattedAnswers);
			return submitQuizAnswers(quizId, formattedAnswers);
		},
		onSuccess: () => {
			successToast('Your answers have been submitted!', {
				position: 'top-center',
			});
		},
		onError: (error: Error) => {
			errorToast(error.message, {
				position: 'top-center',
			});
		},
	});

	const handleAnswerChange = (questionId: string, value: string) => {
		setAnswers((prevAnswers) => ({
			...prevAnswers,
			[questionId]: value,
		}));
	};

	const handleSubmit = async () => {
		setIsSubmitting(true);
		try {
			await submitMutation.mutateAsync();
		} catch (error) {
			console.error('Submission error:', error);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (isLoading) return <p>Loading quiz questions...</p>;
	if (isError) return <p>Error: {(error as Error).message}</p>;

	return (
		<div className="flex flex-col items-center justify-center p-6">
			<h2 className="text-2xl font-bold">Submit Your Quiz Answers</h2>
			<p className="mt-2">Quiz ID: {quizId}</p>

			<div className="mt-4">
				{questions?.map((question: Question) => (
					<div
						key={question.id}
						className="space-y-4"
					>
						<div className="font-bold">{question.text}</div>
						<div className="space-y-2">
							{question.options.map((option, optionIndex) => (
								<div
									key={optionIndex}
									className="flex items-center gap-2"
								>
									<input
										type="radio"
										id={`answer-${question.id}-${optionIndex}`}
										name={`question-${question.id}`}
										value={option}
										onChange={() =>
											handleAnswerChange(
												question.id,
												option
											)
										}
										checked={
											answers[question.id] === option
										}
									/>
									<label
										htmlFor={`answer-${question.id}-${optionIndex}`}
									>
										{option}
									</label>
								</div>
							))}
						</div>
					</div>
				))}

				<Button
					onClick={handleSubmit}
					disabled={
						isSubmitting ||
						Object.keys(answers).length !== questions?.length
					}
					className="mt-4"
				>
					{isSubmitting ? 'Submitting...' : 'Submit Answers'}
				</Button>
			</div>
		</div>
	);
};

export default Submit;
