import { useState } from 'react';
import { z } from 'zod';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	FormDescription,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus, Check } from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useParams } from 'react-router';
import { errorToast, successToast } from '../global/toast';

const quizQuestionSchema = z.object({
	quizId: z.string().min(1, { message: 'Quiz ID is required' }),
	text: z
		.string()
		.min(3, { message: 'Question must be at least 3 characters' })
		.max(500, { message: 'Question is too long' }),
	options: z
		.array(
			z
				.string()
				.min(1, { message: 'Option text is required' })
				.max(200, { message: 'Option is too long' })
		)
		.min(2, { message: 'At least 2 options are required' })
		.max(5, { message: 'Maximum 5 options allowed' }),
	correct: z.string().min(0, { message: 'Please select the correct answer' }),
});

type QuizQuestionSchemaType = z.infer<typeof quizQuestionSchema>;

const createQuizQuestion = async (
	data: QuizQuestionSchemaType & { userId: string }
) => {
	const response = await axios.post(
		`${import.meta.env.VITE_SERVER_URL}/api/quiz/questions/create`,
		data,
		{ withCredentials: true }
	);
	return response.data;
};

export default function DynamicQuizForm() {
	const params = useParams();
	const quizId = params?.quizId as string;
	const { user } = useUser();
	const [correctOption, setCorrectOption] = useState<number>(0);

	const form = useForm<QuizQuestionSchemaType>({
		resolver: zodResolver(quizQuestionSchema),
		defaultValues: {
			quizId: quizId || '',
			text: '',
			options: ['', ''],
			correct: '',
		},
	});

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: 'options',
	});

	const createQuestionMutation = useMutation({
		mutationFn: async (data: QuizQuestionSchemaType) => {
			if (!quizId || !user?.id) {
				throw new Error('Quiz ID or User not found');
			}

			console.log({
				...data,
			});

			return createQuizQuestion({ ...data, userId: user.id });
		},
		onSuccess: () => {
			successToast('Question Added', {
				position: 'top-center',
			});

			setCorrectOption(0);
		},
		onError: (error: Error) => {
			errorToast(error.message, {
				position: 'top-center',
			});
		},
	});

	const handleSubmit = async (data: QuizQuestionSchemaType) => { 
		const formData = {
			...data,
			correct: form.getValues().options[correctOption],
		};

		try {
			await createQuestionMutation.mutateAsync(formData);
		} catch (error) {
			console.error('Form submission error:', error);
		}
	};

	const handleCorrectOptionSelect = (index: number) => {
		setCorrectOption(index);
		form.setValue('correct', form.getValues().options[index]);
	};

	return (
		<Card className="flex flex-col w-full items-center justify-between rounded-lg bg-sidebar p-4">
			<CardHeader>
				<CardTitle>Add Quiz Question</CardTitle>
			</CardHeader>
			<CardContent className="w-full space-y-4">
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(handleSubmit)}
						className="space-y-6"
					>
						{/* Question Input */}
						<FormField
							control={form.control}
							name="text"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Question Text</FormLabel>
									<FormControl>
										<Input
											{...field}
											placeholder="Enter your question here"
											className="resize-none"
										/>
									</FormControl>
									<FormDescription>
										Write a clear and concise question
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="space-y-8">
							<FormLabel>Answer Options</FormLabel>
							<FormDescription>
								Add between 2-5 options and select the correct
								answer
							</FormDescription>

							<div className="space-y-2">
								{fields.map((field, index) => (
									<div
										key={field.id}
										className="flex items-center gap-2"
									>
										<Controller
											control={form.control}
											name={`options.${index}`}
											render={({ field: inputField }) => (
												<FormItem className="flex-1">
													<FormControl>
														<Input
															{...inputField}
															placeholder={`Option ${
																index + 1
															}`}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<Button
											type="button"
											variant={
												correctOption === index
													? 'default'
													: 'outline'
											}
											size="icon"
											onClick={() =>
												handleCorrectOptionSelect(index)
											}
											className="flex-shrink-0"
										>
											<Check
												className={`h-4 w-4 ${
													correctOption === index
														? 'text-white'
														: ''
												}`}
											/>
											<span className="sr-only">
												Set as correct answer
											</span>
										</Button>

										{fields.length > 2 && (
											<Button
												type="button"
												variant="destructive"
												size="icon"
												onClick={() => {
													remove(index);
													if (
														correctOption === index
													) {
														handleCorrectOptionSelect(
															0
														);
													}
												}}
												className="flex-shrink-0"
											>
												<Trash2 className="h-4 w-4" />
												<span className="sr-only">
													Remove option
												</span>
											</Button>
										)}
									</div>
								))}
							</div>

							{fields.length < 5 && (
								<Button
									type="button"
									variant="outline"
									onClick={() => append('')}
									className="w-full mt-4"
								>
									<Plus className="mr-2 h-4 w-4 " />
									Add Option
								</Button>
							)}
						</div>

						<Button
							type="submit"
							className="w-full mt-4"
							disabled={createQuestionMutation.isPending}
						>
							{createQuestionMutation.isPending ? (
								<>Adding Question...</>
							) : (
								<>Add Question</>
							)}
						</Button>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
