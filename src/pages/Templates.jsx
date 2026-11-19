import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  Info,
  LayoutGrid,
  Plus,
  Search,
  SearchX,
  X,
} from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import { buttonStyles } from '../components/ui/buttonStyles'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import TemplateCard from '../components/templates/TemplateCard'
import QRVisual from '../components/qr/QRVisual'
import {
  getTemplateById,
  getTemplateCategory,
  QR_TEMPLATES,
  TEMPLATE_CATEGORIES,
} from '../data/templates'
import { getQRType } from '../data/qrTypes'
import { buildQRPayload, mergeCustomization } from '../utils/qrUtils'

export default function Templates() {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState('all')
  const [query, setQuery] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState(null)

  const categoryCounts = useMemo(() => {
    return QR_TEMPLATES.reduce(
      (counts, template) => {
        counts[template.category] = (counts[template.category] || 0) + 1
        counts.all += 1
        return counts
      },
      { all: 0 },
    )
  }, [])

  const filteredTemplates = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return QR_TEMPLATES.filter((template) => {
      const matchesCategory =
        activeCategory === 'all' || template.category === activeCategory
      if (!matchesCategory) return false
      if (!normalizedQuery) return true

      const type = getQRType(template.type)
      const category = getTemplateCategory(template.category)
      return `${template.name} ${template.description} ${type.label} ${category.label}`
        .toLowerCase()
        .includes(normalizedQuery)
    })
  }, [activeCategory, query])

  const selected =
    typeof selectedTemplate === 'string'
      ? getTemplateById(selectedTemplate)
      : selectedTemplate
  const selectedType = selected ? getQRType(selected.type) : null
  const selectedCategory = selected
    ? getTemplateCategory(selected.category)
    : null
  const SelectedTypeIcon = selectedType?.icon ?? null
  const SelectedCategoryIcon = selectedCategory?.icon ?? null
  const selectedPayload = selected
    ? buildQRPayload(selected.type, selected.fields)
    : ''
  const selectedDesign = selected
    ? mergeCustomization({
        ...selected.customization,
        fgColor: selected.customization?.fgColor || '#0F172A',
        bgColor: selected.customization?.bgColor || '#FFFFFF',
      })
    : null

  function applyTemplate(template) {
    setSelectedTemplate(null)
    navigate(`/generator?template=${template.id}`)
  }

  const hasFilters = activeCategory !== 'all' || Boolean(query.trim())

  function clearFilters() {
    setActiveCategory('all')
    setQuery('')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Template gallery"
        title="A better starting point."
        description="Thoughtfully designed QR experiences for real-world moments. Pick one, then make every detail your own."
        actions={
          <Link
            to="/generator"
            className={buttonStyles({
              variant: 'secondary',
              size: 'md',
            })}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Start from blank
          </Link>
        }
      />

      <section className="card overflow-hidden">
        <div className="border-b border-line bg-surface-soft p-3 sm:p-4">
          <div
            className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5 sm:flex-wrap sm:overflow-visible"
            role="group"
            aria-label="Template categories"
          >
            {TEMPLATE_CATEGORIES.map((category) => {
              const Icon = category.icon
              const active = activeCategory === category.id
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setActiveCategory(category.id)}
                  aria-pressed={active}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl border px-2.5 py-2 text-[0.6875rem] font-semibold transition-colors ${
                    active
                      ? 'border-brand bg-brand-soft text-brand-ink'
                      : 'border-line bg-surface text-ink-soft hover:border-line-strong hover:text-ink'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {category.label}
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[0.5625rem] ${
                      active
                        ? 'bg-surface text-brand-ink'
                        : 'bg-surface-muted text-ink-faint'
                    }`}
                  >
                    {categoryCounts[category.id] || 0}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search templates…"
              className="control h-9 pl-8 pr-8 text-xs"
              aria-label="Search templates"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-ink-faint hover:bg-surface-muted hover:text-ink"
                aria-label="Clear template search"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            ) : null}
          </div>
          <p className="text-[0.6875rem] text-ink-faint">
            {filteredTemplates.length}{' '}
            {filteredTemplates.length === 1 ? 'template' : 'templates'}
            {hasFilters ? ' matching your filters' : ' to explore'}
          </p>
        </div>
      </section>

      {filteredTemplates.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onPreview={(entry) => setSelectedTemplate(entry)}
              onUse={applyTemplate}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={SearchX}
          title="No templates found"
          description="Try another category or search term, or start with a blank QR code."
          action={
            <Button type="button" variant="secondary" onClick={clearFilters}>
              Clear filters
            </Button>
          }
          secondaryAction={
            <Link
              to="/generator"
              className={buttonStyles({ variant: 'primary', size: 'md' })}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Create a blank QR
            </Link>
          }
        />
      )}

      <section className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-line bg-surface px-5 py-5 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-ink-soft">
            <LayoutGrid className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[0.8125rem] font-semibold text-ink">
              Have a format in mind?
            </p>
            <p className="mt-0.5 text-xs leading-5 text-ink-soft">
              Start from a blank canvas with all ten QR types and full design controls.
            </p>
          </div>
        </div>
        <Link
          to="/generator"
          className={buttonStyles({
            variant: 'ghost',
            size: 'sm',
            className: 'shrink-0 px-2',
          })}
        >
          Open generator
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </section>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelectedTemplate(null)}
        title={selected?.name || 'Template preview'}
        description={selected?.description}
        size="lg"
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setSelectedTemplate(null)}
            >
              Close preview
            </Button>
            <Button type="button" onClick={() => selected && applyTemplate(selected)}>
              Open in generator
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </>
        }
      >
        {selected && selectedDesign && selectedType && selectedCategory ? (
          <div className="grid gap-5 sm:grid-cols-[minmax(0,220px)_minmax(0,1fr)] sm:gap-6">
            <div
              className="flex items-center justify-center rounded-2xl p-5"
              style={{ backgroundColor: selectedDesign.bgColor }}
            >
              <div className="w-full max-w-[13rem] rounded-xl border border-black/5 bg-white p-2 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.5)]">
                {selectedPayload ? (
                  <QRVisual
                    value={selectedPayload}
                    customization={selectedDesign}
                    size={600}
                    title={`${selected.name} sample QR code`}
                    className="h-auto w-full rounded-md"
                  />
                ) : null}
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-2.5 py-1 text-[0.625rem] font-semibold text-ink-soft">
                  {SelectedCategoryIcon ? (
                    <SelectedCategoryIcon className="h-3 w-3" aria-hidden="true" />
                  ) : null}
                  {selectedCategory.label}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-2.5 py-1 text-[0.625rem] font-semibold text-ink-soft">
                  {SelectedTypeIcon ? (
                    <SelectedTypeIcon className="h-3 w-3" aria-hidden="true" />
                  ) : null}
                  {selectedType.label}
                </span>
              </div>

              <h3 className="mt-3 text-sm font-semibold text-ink">What’s included</h3>
              <div className="mt-2 space-y-2">
                {[
                  'A real, scannable QR sample',
                  'Pre-filled content you can edit',
                  'Considered colors with strong contrast',
                  'High-resolution PNG and SVG export',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                    <span className="text-xs leading-5 text-ink-soft">{item}</span>
                  </div>
                ))}
              </div>

              <div className="callout callout-info mt-4">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>
                  Sample content and colors are applied in the generator. Every detail
                  can be edited before you save.
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
