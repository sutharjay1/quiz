'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { useQuiz } from '@/hooks/use-quiz';
import { cn } from '@/lib/utils';
import { Check, Copy, Share2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { useParams } from 'react-router';
import { successToast } from '../global/toast';

const QuizLink = () => {
	const params = useParams();
	const quizId = params?.quizId as string;

	const [copied, setCopied] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const { quiz } = useQuiz();

	const shareLink = `${window.location.origin}/submit/${quiz?.id}`;

	const handleCopy = () => {
		if (inputRef.current) {
			navigator.clipboard.writeText(inputRef.current.value);
			setCopied(true);
			successToast('Copied to clipboard', { duration: 1500 });
			setTimeout(() => setCopied(false), 2000);
		}
	};

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					className="gap-2"
				>
					<Share2 className="h-4 w-4" />
					<span className="hidden md:flex">Share Form</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className="w-80 p-4"
				align="end"
			>
				<div className="space-y-4">
					<div>
						<h4 className="mb-1 text-lg font-medium">
							Form Share Link
						</h4>
						<p className="text-sm text-muted-foreground">
							Anyone with this link can submit to your form.
						</p>
					</div>
					<div className="flex items-center space-x-2">
						<div className="relative flex items-center space-x-2">
							<Input
								ref={inputRef}
								value={shareLink}
								readOnly
								className="w-96 pr-10"
							/>
							<Button
								size="sm"
								variant="outline"
								className={cn(
									'ml-2 rounded-xl px-3 py-4 transition-all',
									copied && 'text-green-500'
								)}
								onClick={handleCopy}
							>
								{copied ? (
									<Check className="h-4 w-4" />
								) : (
									<Copy className="h-4 w-4" />
								)}
								<span className="sr-only">
									{copied ? 'Copied' : 'Copy to clipboard'}
								</span>
							</Button>
						</div>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
};

export { QuizLink };
