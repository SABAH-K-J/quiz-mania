import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  GripVertical,
  ListChecks,
  PlusCircle,
  Rocket,
  Save,
  Sparkles,
  Trash2,
  TriangleAlert,
} from 'lucide-react'
import { getErrorMessage, questionAPI, quizAPI } from '../services/api'
import { Alert, Spinner } from './ui'

const CATEGORIES = [
  { value: 'general', label: 'General knowledge' },
  { value: 'science', label: 'Science' },
  { value: 'math', label: 'Mathematics' },
  { value: 'history', label: 'History' },
  { value: 'geography', label: 'Geography' },
  { value: 'technology', label: 'Technology' },
  { value: 'sports', label: 'Sports' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'other', label: 'Other' },
]

const QUESTION_TYPES = [
  { value: 'multiple_choice', label: 'Multiple choice', hint: 'One correct answer' },
  { value: 'true_false', label: 'True / false', hint: 'Exactly two options' },
  { value: 'multi_select', label: 'Multiple select', hint: 'One or more correct answers' },
]

let localId = 0
const nextLocalId = () => {
  localId += 1
  return `new-${localId}`
}

const emptyOption = (order) => ({ key: nextLocalId(), text: '', is_correct: false, order })

const emptyQuestion = (order) => ({
  key: nextLocalId(),
  text: '',
  question_type: 'multiple_choice',
  points: 1,
  order,
  explanation: '',
  options: [emptyOption(0), emptyOption(1)],
})

function maxOptionsFor(type) {
  return type === 'multi_select' ? 6 : 4
}

function normalizeQuiz(quiz) {
  return {
    title: quiz?.title || '',
    description: quiz?.description || '',
    category: quiz?.category || 'general',
    time_limit_minutes: quiz?.time_limit ? Math.round((quiz.time_limit / 60) * 10) / 10 : '',
    show_correct_answers: quiz?.show_correct_answers ?? true,
    allow_retake: quiz?.allow_retake ?? true,
  }
}

function normalizeQuestion(question, index) {
  return {
    key: question.id ? `saved-${question.id}` : nextLocalId(),
    id: question.id,
    text: question.text || '',
    question_type: question.question_type || 'multiple_choice',
    points: question.points ?? 1,
    order: question.order ?? index,
    explanation: question.explanation || '',
    options: (question.options || []).map((option, optionIndex) => ({
      key: option.id ? `saved-option-${option.id}` : nextLocalId(),
      id: option.id,
      text: option.text || '',
      is_correct: Boolean(option.is_correct),
      order: option.order ?? optionIndex,
    })),
  }
}

export default function QuizBuilder({ mode = 'create', quizId, initialQuiz, initialQuestions = [] }) {
  const navigate = useNavigate()
  const location = useLocation()
  const isEdit = mode === 'edit'

  const [quiz, setQuiz] = useState(() => normalizeQuiz(initialQuiz))
  const [questions, setQuestions] = useState(() =>
    initialQuestions.length > 0 ? initialQuestions.map(normalizeQuestion) : [emptyQuestion(0)],
  )
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState([])
  const [busy, setBusy] = useState(false)
  const [busyLabel, setBusyLabel] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  const totalPoints = useMemo(
    () => questions.reduce((sum, question) => sum + (Number(question.points) || 0), 0),
    [questions],
  )

  const updateQuiz = (field, value) => {
    setQuiz((current) => ({ ...current, [field]: value }))
    setError('')
  }

  const updateQuestion = (index, field, value) => {
    setQuestions((current) =>
      current.map((question, questionIndex) =>
        questionIndex === index ? { ...question, [field]: value } : question,
      ),
    )
    setError('')
  }

  const updateOption = (questionIndex, optionIndex, field, value) => {
    setQuestions((current) =>
      current.map((question, index) => {
        if (index !== questionIndex) return question

        const options = question.options.map((option, oIndex) => {
          if (oIndex === optionIndex) return { ...option, [field]: value }
          // Single-answer questions keep exactly one correct option.
          if (field === 'is_correct' && value && question.question_type !== 'multi_select') {
            return { ...option, is_correct: false }
          }
          return option
        })

        return { ...question, options }
      }),
    )
    setError('')
  }

  const changeType = (index, type) => {
    setQuestions((current) =>
      current.map((question, questionIndex) => {
        if (questionIndex !== index) return question
        if (type === 'true_false') {
          return {
            ...question,
            question_type: type,
            options: [
              { key: nextLocalId(), text: 'True', is_correct: true, order: 0 },
              { key: nextLocalId(), text: 'False', is_correct: false, order: 1 },
            ],
          }
        }
        const limit = type === 'multi_select' ? 6 : 4
        const options = question.options.slice(0, limit)
        while (options.length < 2) options.push(emptyOption(options.length))
        return { ...question, question_type: type, options }
      }),
    )
  }

  const addQuestion = () => {
    setQuestions((current) => [...current, emptyQuestion(current.length)])
  }

  const removeQuestion = async (index) => {
    const question = questions[index]
    if (question.id) {
      if (!window.confirm('Delete this question? This cannot be undone.')) return
      setDeletingId(question.id)
      setError('')
      try {
        await questionAPI.delete(question.id)
      } catch (deleteError) {
        setError(getErrorMessage(deleteError, 'That question could not be deleted.'))
        setDeletingId(null)
        return
      }
      setDeletingId(null)
    }
    setQuestions((current) => current.filter((_, questionIndex) => questionIndex !== index))
  }

  const addOption = (index) => {
    setQuestions((current) =>
      current.map((question, questionIndex) => {
        if (questionIndex !== index) return question
        if (question.options.length >= maxOptionsFor(question.question_type)) return question
        return { ...question, options: [...question.options, emptyOption(question.options.length)] }
      }),
    )
  }

  const removeOption = (questionIndex, optionIndex) => {
    setQuestions((current) =>
      current.map((question, index) => {
        if (index !== questionIndex || question.options.length <= 2) return question
        return { ...question, options: question.options.filter((_, oIndex) => oIndex !== optionIndex) }
      }),
    )
  }

  const validate = () => {
    const issues = []
    if (!quiz.title.trim()) issues.push('Give your quiz a title.')

    if (questions.length === 0) issues.push('Add at least one question.')

    questions.forEach((question, index) => {
      const label = `Question ${index + 1}`
      if (!question.text.trim()) issues.push(`${label} needs text.`)

      const filledOptions = question.options.filter((option) => option.text.trim())
      if (filledOptions.length < 2) issues.push(`${label} needs at least two answer options.`)
      if (filledOptions.length !== question.options.length) issues.push(`${label} has an empty answer option.`)
      if (!question.options.some((option) => option.is_correct)) issues.push(`${label} needs a correct answer.`)
      if (question.question_type === 'true_false' && question.options.length !== 2) {
        issues.push(`${label} must have exactly two options.`)
      }
      if (question.question_type !== 'multi_select' && question.options.filter((option) => option.is_correct).length > 1) {
        issues.push(`${label} can only have one correct answer.`)
      }
      if (!Number.isFinite(Number(question.points)) || Number(question.points) < 1) {
        issues.push(`${label} needs at least 1 point.`)
      }
    })

    return issues
  }

  const buildQuestionPayload = (question, index) => ({
    text: question.text.trim(),
    question_type: question.question_type,
    points: Math.max(1, Number(question.points) || 1),
    order: index,
    explanation: question.explanation.trim(),
    options: question.options.map((option, optionIndex) => ({
      ...(option.id ? { id: option.id } : {}),
      text: option.text.trim(),
      is_correct: Boolean(option.is_correct),
      order: optionIndex,
    })),
  })

  const handleSubmit = async (event, publish = false) => {
    event.preventDefault()
    const issues = validate()
    if (issues.length > 0) {
      setFieldErrors(issues)
      setError('A few things need fixing before this quiz can be saved.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setFieldErrors([])
    setError('')
    setBusy(true)
    setBusyLabel(publish ? 'Publishing your quiz…' : 'Saving your quiz…')

    const quizPayload = {
      title: quiz.title.trim(),
      description: quiz.description.trim(),
      category: quiz.category,
      time_limit: quiz.time_limit_minutes === '' ? null : Math.round(Number(quiz.time_limit_minutes) * 60),
      show_correct_answers: quiz.show_correct_answers,
      allow_retake: quiz.allow_retake,
    }

    try {
      let targetId = quizId

      if (isEdit) {
        await quizAPI.update(targetId, quizPayload)
      } else {
        const response = await quizAPI.create(quizPayload)
        targetId = response.data.id
      }

      for (let index = 0; index < questions.length; index += 1) {
        const question = questions[index]
        const payload = buildQuestionPayload(question, index)
        if (question.id) {
          await questionAPI.update(question.id, payload)
        } else {
          await questionAPI.create({ ...payload, quiz_id: targetId })
        }
      }

      if (publish) {
        try {
          await quizAPI.publish(targetId)
        } catch (publishError) {
          setBusy(false)
          setBusyLabel('')
          setError(
            `${getErrorMessage(
              publishError,
              'The quiz was saved, but publishing failed.',
            )} Your work is safe — fix the issue and publish from your dashboard.`,
          )
          if (!isEdit) {
            navigate(`/quiz/edit/${targetId}`, { replace: true })
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }
          return
        }
      }

      navigate('/dashboard', {
        replace: true,
        state: {
          notice: publish
            ? 'Your quiz is live. Share its code with your players.'
            : 'Saved as a draft. Publish it when you are ready.',
        },
      })
    } catch (saveError) {
      const message = getErrorMessage(saveError, 'We could not save your quiz. Please try again.')
      setError(message)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setBusy(false)
      setBusyLabel('')
    }
  }

  const stateNotice = location.state?.notice

  return (
    <form onSubmit={(event) => handleSubmit(event, false)} className="space-y-6">
      {stateNotice && (
        <Alert tone="info" className="mb-2">
          {stateNotice}
        </Alert>
      )}

      {error && (
        <Alert tone="error">
          <p>{error}</p>
          {fieldErrors.length > 0 && (
            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs">
              {fieldErrors.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          )}
        </Alert>
      )}

      {/* Details */}
      <section className="surface p-5 sm:p-7" aria-labelledby="details-heading">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-secondary-300" aria-hidden="true" />
          <h2 id="details-heading" className="text-xl font-bold">
            Quiz details
          </h2>
        </div>

        <div className="mt-5 grid gap-5">
          <div>
            <label htmlFor="title" className="label">
              Title <span className="text-rose-300">*</span>
            </label>
            <input
              id="title"
              type="text"
              className="input-field"
              placeholder="e.g. Space trivia: moons and missions"
              value={quiz.title}
              onChange={(event) => updateQuiz('title', event.target.value)}
              maxLength={200}
              required
            />
            <p className="hint">{quiz.title.length}/200 characters</p>
          </div>

          <div>
            <label htmlFor="description" className="label">
              Description <span className="font-normal text-slate-500">(optional)</span>
            </label>
            <textarea
              id="description"
              rows={3}
              className="input-field"
              placeholder="What is this quiz about? Players see this before they start."
              value={quiz.description}
              onChange={(event) => updateQuiz('description', event.target.value)}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="category" className="label">
                Category
              </label>
              <select
                id="category"
                className="input-field"
                value={quiz.category}
                onChange={(event) => updateQuiz('category', event.target.value)}
              >
                {CATEGORIES.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="time_limit" className="label">
                Time limit
              </label>
              <div className="relative">
                <Clock3
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  aria-hidden="true"
                />
                <input
                  id="time_limit"
                  type="number"
                  min="0.5"
                  max="1440"
                  step="0.5"
                  className="input-field pl-10"
                  placeholder="No limit"
                  value={quiz.time_limit_minutes}
                  onChange={(event) => updateQuiz('time_limit_minutes', event.target.value)}
                />
              </div>
              <p className="hint">Minutes. Leave empty for an untimed quiz.</p>
            </div>
          </div>

          <fieldset className="grid gap-3 sm:grid-cols-2">
            <legend className="sr-only">Quiz options</legend>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/20">
              <input
                type="checkbox"
                className="mt-0.5 h-5 w-5 rounded border-white/20 bg-ink-900 text-primary-500 focus:ring-primary-400"
                checked={quiz.show_correct_answers}
                onChange={(event) => updateQuiz('show_correct_answers', event.target.checked)}
              />
              <span>
                <span className="block text-sm font-semibold text-white">Reveal correct answers</span>
                <span className="mt-0.5 block text-xs text-slate-400">
                  Show which answers were right after submitting.
                </span>
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/20">
              <input
                type="checkbox"
                className="mt-0.5 h-5 w-5 rounded border-white/20 bg-ink-900 text-primary-500 focus:ring-primary-400"
                checked={quiz.allow_retake}
                onChange={(event) => updateQuiz('allow_retake', event.target.checked)}
              />
              <span>
                <span className="block text-sm font-semibold text-white">Allow retakes</span>
                <span className="mt-0.5 block text-xs text-slate-400">
                  Players can take this quiz more than once.
                </span>
              </span>
            </label>
          </fieldset>
        </div>
      </section>

      {/* Questions */}
      <section className="surface p-5 sm:p-7" aria-labelledby="questions-heading">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <ListChecks size={18} className="text-primary-300" aria-hidden="true" />
              <h2 id="questions-heading" className="text-xl font-bold">
                Questions
              </h2>
            </div>
            <p className="mt-1 text-sm text-slate-400">
              {questions.length} question{questions.length === 1 ? '' : 's'} · {totalPoints} total point
              {totalPoints === 1 ? '' : 's'}
            </p>
          </div>
          <button type="button" onClick={addQuestion} className="btn-secondary">
            <PlusCircle size={17} aria-hidden="true" /> Add question
          </button>
        </div>

        <div className="mt-6 space-y-5">
          {questions.map((question, questionIndex) => {
            const optionLimit = maxOptionsFor(question.question_type)
            const isTrueFalse = question.question_type === 'true_false'

            return (
              <article key={question.key} className="rounded-2xl border border-white/10 bg-ink-950/40 p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                    <GripVertical size={16} className="text-slate-600" aria-hidden="true" />
                    Question {questionIndex + 1}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeQuestion(questionIndex)}
                    disabled={deletingId === question.id || questions.length === 1}
                    className="btn-ghost px-2 text-rose-300 hover:bg-rose-500/10"
                    aria-label={`Delete question ${questionIndex + 1}`}
                  >
                    <Trash2 size={17} aria-hidden="true" />
                  </button>
                </div>

                <div className="mt-3">
                  <label htmlFor={`question-${question.key}`} className="label">
                    Question text <span className="text-rose-300">*</span>
                  </label>
                  <textarea
                    id={`question-${question.key}`}
                    rows={2}
                    className="input-field"
                    placeholder="Type the question your players will answer"
                    value={question.text}
                    onChange={(event) => updateQuestion(questionIndex, 'text', event.target.value)}
                  />
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-[1.4fr_0.6fr]">
                  <div>
                    <span className="label">Answer type</span>
                    <div className="flex flex-wrap gap-2" role="group" aria-label={`Answer type for question ${questionIndex + 1}`}>
                      {QUESTION_TYPES.map((type) => {
                        const active = question.question_type === type.value
                        return (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => changeType(questionIndex, type.value)}
                            aria-pressed={active}
                            className={`min-h-[44px] rounded-xl border px-3 py-2 text-left text-xs transition ${
                              active
                                ? 'border-primary-400/60 bg-primary-500/15 text-white'
                                : 'border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/25 hover:text-white'
                            }`}
                          >
                            <span className="block font-semibold">{type.label}</span>
                            <span className="mt-0.5 block text-[11px] text-slate-400">{type.hint}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <label htmlFor={`points-${question.key}`} className="label">
                      Points
                    </label>
                    <input
                      id={`points-${question.key}`}
                      type="number"
                      min="1"
                      max="100"
                      className="input-field"
                      value={question.points}
                      onChange={(event) => updateQuestion(questionIndex, 'points', event.target.value)}
                    />
                  </div>
                </div>

                <fieldset className="mt-4">
                  <legend className="label">
                    Answer options <span className="text-rose-300">*</span>
                  </legend>
                  <p className="hint -mt-1 mb-3">
                    Tick every correct answer. {isTrueFalse ? 'True/false is fixed to two options.' : `Use 2–${optionLimit} options.`}
                  </p>

                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <div key={option.key} className="flex items-center gap-2">
                        <label
                          className={`grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-lg border transition ${
                            option.is_correct
                              ? 'border-emerald-400/60 bg-emerald-500/20 text-emerald-300'
                              : 'border-white/10 bg-white/[0.03] text-slate-500 hover:border-white/25'
                          }`}
                          title="Mark as correct"
                        >
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={option.is_correct}
                            onChange={(event) =>
                              updateOption(questionIndex, optionIndex, 'is_correct', event.target.checked)
                            }
                            aria-label={`Mark option ${optionIndex + 1} as correct for question ${questionIndex + 1}`}
                          />
                          <CheckCircle2 size={18} aria-hidden="true" />
                        </label>

                        <input
                          type="text"
                          className="input-field"
                          placeholder={`Option ${optionIndex + 1}`}
                          value={option.text}
                          onChange={(event) => updateOption(questionIndex, optionIndex, 'text', event.target.value)}
                          disabled={isTrueFalse}
                          aria-label={`Option ${optionIndex + 1} for question ${questionIndex + 1}`}
                          required
                        />

                        {!isTrueFalse && question.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(questionIndex, optionIndex)}
                            className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-300"
                            aria-label={`Remove option ${optionIndex + 1}`}
                          >
                            <Trash2 size={16} aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {!isTrueFalse && question.options.length < optionLimit && (
                    <button
                      type="button"
                      onClick={() => addOption(questionIndex)}
                      className="btn-ghost mt-2 px-2 text-sm text-primary-300"
                    >
                      <PlusCircle size={16} aria-hidden="true" /> Add another option
                    </button>
                  )}
                </fieldset>

                <div className="mt-4">
                  <label htmlFor={`explanation-${question.key}`} className="label">
                    Explanation <span className="font-normal text-slate-500">(optional)</span>
                  </label>
                  <textarea
                    id={`explanation-${question.key}`}
                    rows={2}
                    className="input-field"
                    placeholder="A short note players can learn from"
                    value={question.explanation}
                    onChange={(event) => updateQuestion(questionIndex, 'explanation', event.target.value)}
                  />
                </div>
              </article>
            )
          })}
        </div>

        <button type="button" onClick={addQuestion} className="btn-secondary mt-5 w-full">
          <PlusCircle size={17} aria-hidden="true" /> Add another question
        </button>
      </section>

      {/* Actions */}
      <div className="surface sticky bottom-4 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/dashboard" className="btn-ghost">
          <ArrowLeft size={17} aria-hidden="true" /> Back to dashboard
        </Link>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button type="submit" disabled={busy} className="btn-secondary">
            <Save size={17} aria-hidden="true" /> {busy ? busyLabel || 'Saving…' : 'Save as draft'}
          </button>
          <button
            type="button"
            onClick={(event) => handleSubmit(event, true)}
            disabled={busy}
            className="btn-primary"
          >
            <Rocket size={17} aria-hidden="true" /> {busy ? busyLabel || 'Working…' : 'Publish quiz'}
          </button>
        </div>
      </div>

      {busy && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink-950/70 backdrop-blur-sm" role="status">
          <div className="surface flex items-center gap-3 p-5">
            <Spinner />
            <span className="font-semibold">{busyLabel || 'Working…'}</span>
          </div>
        </div>
      )}

      {quiz.title.trim() === '' && (
        <p className="flex items-center justify-center gap-2 text-xs text-slate-500">
          <TriangleAlert size={14} aria-hidden="true" /> Your quiz starts as a draft. Nothing is public until you publish.
        </p>
      )}
    </form>
  )
}
