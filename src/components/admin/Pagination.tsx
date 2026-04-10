// src/components/admin/Pagination.tsx
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  pages: number
  total: number
  perPage: number
  onPage: (p: number) => void
}

export default function Pagination({ page, pages, total, perPage, onPage }: PaginationProps) {
  if (pages <= 1) return null

  const from = (page - 1) * perPage + 1
  const to = Math.min(page * perPage, total)

  // Build page numbers with ellipsis
  const items: (number | '...')[] = []
  if (pages <= 7) {
    for (let i = 1; i <= pages; i++) items.push(i)
  } else {
    items.push(1)
    if (page > 3) items.push('...')
    for (let i = Math.max(2, page - 1); i <= Math.min(pages - 1, page + 1); i++) items.push(i)
    if (page < pages - 2) items.push('...')
    items.push(pages)
  }

  return (
    <div className="flex items-center justify-between mt-4 text-sm">
      <p className="text-stone-400 text-xs">
        {from}–{to} de {total}
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
          className="p-1.5 rounded-sm text-stone-400 hover:text-stone-700 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={15} />
        </button>

        {items.map((item, i) =>
          item === '...' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-stone-300 select-none">…</span>
          ) : (
            <button
              key={item}
              onClick={() => onPage(item)}
              className={`min-w-[30px] h-[30px] text-xs rounded-sm transition-colors ${
                item === page
                  ? 'bg-burgundy text-white'
                  : 'text-stone-500 hover:bg-stone-100 hover:text-stone-800'
              }`}
            >
              {item}
            </button>
          )
        )}

        <button
          onClick={() => onPage(page + 1)}
          disabled={page === pages}
          className="p-1.5 rounded-sm text-stone-400 hover:text-stone-700 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  )
}
