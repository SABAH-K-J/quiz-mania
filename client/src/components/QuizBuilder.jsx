import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, Plus, Rocket, Save, Trash2, TriangleAlert } from 'lucide-react'
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
  { value: 'multi_select', label: 'Multiple select', hint: 'One or more correct' },
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

function normalizeQuiz(quiz, initialCategory) {
  return {
    title: quiz?.title || '',
    description: quiz?.description || '',
    category: quiz?.category || initialCategory || 'general',
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

function SectionHead({ number, title, note, children }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink bg-ink px-4 py-2.5 text-white">
      <div className="flex items-baseline gap-3">
        <span className="num text-2xl text-signal-yellow" aria-hidden="true">
          {number}
        </span>
        <h2 className="font-display text-[13px] font-bold uppercase tracking-[0.16em]">{title}</h2>
      </div>
      {children || (note && <span className="text-xs text-ink-300">{note}</span>)}
    </div>
  )
}

export default function QuizBuilder({ mode = 'create', quizId, initialQuiz, initialQuestions = [], initialCategory }) {
  const navigate = useNavigate()
  const location = useLocation()
  const isEdit = mode === 'edit'

  const [quiz, setQuiz] = useState(() => normalizeQuiz(initialQuiz, initialCategory))
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
      {stateNotice && <Alert tone="info">{stateNotice}</Alert>}

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

      <section className="border-2 border-ink bg-white" aria-labelledby="details-heading">
        <SectionHead number="01" title="Quiz details" note="Title, category and rules" />

        <div className="grid gap-5 p-4 sm:p-6">
          <div>
            <label htmlFor="title" className="label">
              Title <span className="text-signal-red-dark">*</span>
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
              Description{' '}
              <span className="font-body font-normal normal-case tracking-normal text-ink-500">(optional)</span>
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
              <input
                id="time_limit"
                type="number"
                min="0.5"
                max="1440"
                step="0.5"
                className="input-field"
                placeholder="No limit"
                value={quiz.time_limit_minutes}
                onChange={(event) => updateQuiz('time_limit_minutes', event.target.value)}
              />
              <p className="hint">Minutes. Leave empty for an untimed quiz.</p>
            </div>
          </div>

          <fieldset className="grid gap-3 sm:grid-cols-2">
            <legend className="sr-only">Quiz options</legend>
            <label className="flex cursor-pointer items-start gap-3 border-2 border-ink bg-arena-50 p-4 transition hover:bg-signal-yellow-soft">
              <input
                type="checkbox"
                className="sr-only"
                checked={quiz.show_correct_answers}
                onChange={(event) => updateQuiz('show_correct_answers', event.target.checked)}
              />
              <span
                className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center border-2 ${
                  quiz.show_correct_answers ? 'border-ink bg-signal-green text-white' : 'border-ink bg-white text-transparent'
                }`}
                aria-hidden="true"
              >
                <Check size={13} strokeWidth={3} />
              </span>
              <span>
                <span className="block font-display text-[15px] font-bold uppercase tracking-[0.06em]">
                  Reveal correct answers
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-ink-600">
                  Show which answers were right after submitting.
                </span>
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-3 border-2 border-ink bg-arena-50 p-4 transition hover:bg-signal-yellow-soft">
              <input
                type="checkbox"
                className="sr-only"
                checked={quiz.allow_retake}
                onChange={(event) => updateQuiz('allow_retake', event.target.checked)}
              />
              <span
                className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center border-2 ${
                  quiz.allow_retake ? 'border-ink bg-signal-green text-white' : 'border-ink bg-white text-transparent'
                }`}
                aria-hidden="true"
              >
                <Check size={13} strokeWidth={3} />
              </span>
              <span>
                <span className="block font-display text-[15px] font-bold uppercase tracking-[0.06em]">
                  Allow retakes
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-ink-600">
                  Players can take this quiz more than once.
                </span>
              </span>
            </label>
          </fieldset>

          <div className="score-strip-3" aria-label="Quiz summary">
            <div className="p-3">
              <p className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-ink-600">Questions</p>
              <p className="num mt-1 text-3xl">{questions.length}</p>
            </div>
            <div className="p-3">
              <p className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-ink-600">Total points</p>
              <p className="num mt-1 text-3xl">{totalPoints}</p>
            </div>
            <div className="p-3">
              <p className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-ink-600">Category</p>
              <p className="mt-2 font-display text-lg font-bold uppercase leading-none tracking-tight">
                {CATEGORIES.find((category) => category.value === quiz.category)?.label || quiz.category}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-2 border-ink bg-white" aria-labelledby="questions-heading">
        <SectionHead number="02" title="Questions" note={`${questions.length} on the board`}>
          <button type="button" onClick={addQuestion} className="btn btn-ghost-light btn-sm">
            <Plus size={15} aria-hidden="true" /> Add question
          </button>
        </SectionHead>

        <div className="space-y-5 p-4 sm:p-6">
          {questions.map((question, questionIndex) => {
            const optionLimit = maxOptionsFor(question.question_type)
            const isTrueFalse = question.question_type === 'true_false'

            return (
              <article key={question.key} className="border-2 border-ink bg-white">
                <div className="flex items-center justify-between gap-3 border-b-2 border-ink bg-arena-50 px-3 py-2.5">
                  <div className="flex items-baseline gap-2.5">
                    <span className="num text-2xl" aria-hidden="true">
                      {String(questionIndex + 1).padStart(2, '0')}
                    </span>
                    <h3 className="font-display text-[12px] font-bold uppercase tracking-[0.16em]">
                      Question {questionIndex + 1}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeQuestion(questionIndex)}
                    disabled={deletingId === question.id || questions.length === 1}
                    className="btn btn-ghost btn-sm px-2 text-signal-red-dark"
                    aria-label={`Delete question ${questionIndex + 1}`}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>

                <div className="p-4 sm:p-5">
                  <div>
                    <label htmlFor={`question-${question.key}`} className="label">
                      Question text <span className="text-signal-red-dark">*</span>
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
                      <div
                        className="grid gap-2 sm:grid-cols-3"
                        role="group"
                        aria-label={`Answer type for question ${questionIndex + 1}`}
                      >
                        {QUESTION_TYPES.map((type) => {
                          const active = question.question_type === type.value
                          return (
                            <button
                              key={type.value}
                              type="button"
                              onClick={() => changeType(questionIndex, type.value)}
                              aria-pressed={active}
                              className={`min-h-[56px] border-2 px-2.5 py-2 text-left transition ${
                                active
                                  ? 'border-ink bg-ink text-white'
                                  : 'border-ink/30 bg-white text-ink hover:border-ink hover:bg-arena-50'
                              }`}
                            >
                              <span className="block font-display text-[13px] font-bold uppercase leading-tight tracking-[0.04em]">
                                {type.label}
                              </span>
                              <span
                                className={`mt-0.5 block text-[11px] leading-snug ${
                                  active ? 'text-ink-200' : 'text-ink-500'
                                }`}
                              >
                                {type.hint}
                              </span>
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
                      Answer options <span className="text-signal-red-dark">*</span>
                    </legend>
                    <p className="hint mb-3 mt-0">
                      Tick every correct answer.{' '}
                      {isTrueFalse ? 'True/false is fixed to two options.' : `Use 2–${optionLimit} options.`}
                    </p>

                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={option.key}
                          className={`flex items-center gap-2 border-2 p-1.5 transition ${
                            option.is_correct ? 'border-signal-green bg-signal-green-soft' : 'border-ink/30 bg-white'
                          }`}
                        >
                          <label
                            className={`grid h-11 w-11 shrink-0 cursor-pointer place-items-center border-2 transition ${
                              option.is_correct
                                ? 'border-ink bg-signal-green text-white'
                                : 'border-ink bg-white text-ink-300 hover:bg-arena-100'
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
                            <Check size={18} strokeWidth={3} aria-hidden="true" />
                          </label>

                          <input
                            type="text"
                            className="min-h-[44px] w-full min-w-0 border-0 bg-transparent px-2 text-[15px] text-ink placeholder:text-ink-500 focus:outline-none focus:ring-2 focus:ring-signal-blue"
                            placeholder={`Option ${optionIndex + 1}`}
                            value={option.text}
                            onChange={(event) => updateOption(questionIndex, optionIndex, 'text', event.target.value)}
                            disabled={isTrueFalse}
                            aria-label={`Option ${optionIndex + 1} for question ${questionIndex + 1}`}
                            required
                          />

                          {!isTrueFalse && question.options.length > 2 ? (
                            <button
                              type="button"
                              onClick={() => removeOption(questionIndex, optionIndex)}
                              className="grid h-11 w-11 shrink-0 place-items-center border-2 border-transparent text-ink-500 transition hover:border-ink hover:bg-ink hover:text-white"
                              aria-label={`Remove option ${optionIndex + 1}`}
                            >
                              <Trash2 size={16} aria-hidden="true" />
                            </button>
                          ) : (
                            <span className="h-11 w-11 shrink-0" aria-hidden="true" />
                          )}
                        </div>
                      ))}
                    </div>

                    {!isTrueFalse && question.options.length < optionLimit && (
                      <button
                        type="button"
                        onClick={() => addOption(questionIndex)}
                        className="btn btn-ghost btn-sm mt-2 px-2 text-signal-blue"
                      >
                        <Plus size={15} aria-hidden="true" /> Add another option
                      </button>
                    )}
                  </fieldset>

                  <div className="mt-4">
                    <label htmlFor={`explanation-${question.key}`} className="label">
                      Explanation{' '}
                      <span className="font-body font-normal normal-case tracking-normal text-ink-500">(optional)</span>
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
                </div>
              </article>
            )
          })}
        </div>

        <div className="border-t-2 border-ink p-4">
          <button type="button" onClick={addQuestion} className="btn btn-secondary w-full">
            <Plus size={17} aria-hidden="true" /> Add another question
          </button>
        </div>
      </section>

      <div className="sticky bottom-0 z-20 border-2 border-ink bg-white p-3 sm:bottom-4 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link to="/dashboard" className="btn btn-ghost btn-sm justify-start">
            <ArrowLeft size={16} aria-hidden="true" /> Back to dashboard
          </Link>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="submit" disabled={busy} className="btn btn-secondary">
              <Save size={16} aria-hidden="true" /> {busy ? busyLabel || 'Saving…' : 'Save as draft'}
            </button>
            <button
              type="button"
              onClick={(event) => handleSubmit(event, true)}
              disabled={busy}
              className="btn btn-primary"
            >
              <Rocket size={16} aria-hidden="true" /> {busy ? busyLabel || 'Working…' : 'Publish quiz'}
            </button>
          </div>
        </div>
      </div>

      {busy && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/80 p-4" role="status" aria-live="polite">
          <div className="flex items-center gap-4 border-2 border-white bg-ink px-6 py-5 text-white">
            <span className="flex gap-1.5" aria-hidden="true">
              <span className="h-3 w-3 animate-pulse bg-signal-red" />
              <span className="h-3 w-3 animate-pulse bg-signal-yellow [animation-delay:120ms]" />
              <span className="h-3 w-3 animate-pulse bg-signal-blue [animation-delay:240ms]" />
            </span>
            <span className="font-display text-sm font-bold uppercase tracking-[0.16em]">
              {busyLabel || 'Working…'}
            </span>
          </div>
        </div>
      )}

      {quiz.title.trim() === '' && (
        <p className="flex items-center justify-center gap-2 text-xs text-ink-600">
          <TriangleAlert size={14} aria-hidden="true" /> Your quiz starts as a draft. Nothing is public until you
          publish.
        </p>
      )}
    </form>
  )
}
