import { ArrowUpRight, Eye } from 'lucide-react'
import Button from '../ui/Button'
import QRVisual from '../qr/QRVisual'
import {
  getTemplateCategory,
} from '../../data/templates'
import { getQRType } from '../../data/qrTypes'
import {
  buildQRPayload,
  mergeCustomization,
} from '../../utils/qrUtils'

export default function TemplateCard({ template, onPreview, onUse }) {
  const category = getTemplateCategory(template.category)
  const CategoryIcon = category.icon
  const type = getQRType(template.type)
  const TypeIcon = type.icon
  const payload = buildQRPayload(template.type, template.fields)
  const customization = mergeCustomization({
    ...template.customization,
    fgColor: template.customization?.fgColor || '#0F172A',
    bgColor: template.customization?.bgColor || '#FFFFFF',
  })

  return (
    <article className="card group flex flex-col overflow-hidden transition-[border-color,box-shadow] duration-200 hover:border-line-strong hover:shadow-[var(--shadow-float)]">
      <div
        className={`relative flex min-h-[12.5rem] items-center justify-center overflow-hidden px-5 py-6 ${
          customization.transparent ? 'checkerboard' : ''
        }`}
        style={
          customization.transparent
            ? undefined
            : { backgroundColor: customization.bgColor }
        }
      >
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-35" />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-black/5 bg-white/80 px-2.5 py-1 text-[0.625rem] font-semibold text-slate-700 shadow-sm backdrop-blur-sm">
          <CategoryIcon className="h-3 w-3" aria-hidden="true" />
          {category.label}
        </span>
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-black/5 bg-white/80 px-2 py-1 text-[0.625rem] font-medium text-slate-600 shadow-sm backdrop-blur-sm">
          <TypeIcon className="h-3 w-3" aria-hidden="true" />
          {type.label}
        </span>

        <button
          type="button"
          onClick={() => onPreview(template)}
          className="relative rounded-2xl border border-black/5 bg-white p-2 shadow-[0_12px_35px_-18px_rgba(15,23,42,0.4)] transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:scale-[1.015]"
          aria-label={`Preview ${template.name} template`}
        >
          {payload ? (
            <QRVisual
              value={payload}
              customization={customization}
              size={420}
              title={`${template.name} sample QR code`}
              className="h-auto w-[6.75rem] rounded-md sm:w-[7.25rem]"
            />
          ) : null}
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-[0.9375rem] font-semibold tracking-[-0.02em] text-ink">
          {template.name}
        </h3>
        <p className="mt-1.5 line-clamp-2 flex-1 text-xs leading-5 text-ink-soft">
          {template.description}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onPreview(template)}
          >
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
            Preview
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => onUse(template)}
          >
            Use template
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </article>
  )
}
