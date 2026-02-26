import ReactEcs, { UiEntity, Label, Button } from '@dcl/sdk/react-ecs'
import { catalogState, nextPage, prevPage } from '../catalogUI'

export function Pagination(): ReactEcs.JSX.Element {
  const isFirstPage = catalogState.page === 0
  const isLastPage = catalogState.page >= catalogState.totalPages - 1
  const pageLabel = `${catalogState.page + 1} / ${Math.max(1, catalogState.totalPages)}`

  return (
    <UiEntity
      uiTransform={{
        width: '100%',
        height: 53,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: { left: 14, right: 14, top: 0, bottom: 0 }
      }}
      uiBackground={{ color: { r: 0.07, g: 0.03, b: 0.16, a: 1 } }}
    >
      <Button
        value="< Prev"
        variant="secondary"
        onMouseDown={prevPage}
        uiTransform={{ width: 91, height: 36 }}
        fontSize={14}
      />
      <Label
        value={pageLabel}
        fontSize={16}
        color={{ r: 0.8, g: 0.75, b: 1, a: isFirstPage && isLastPage ? 0.4 : 1 }}
      />
      <Button
        value="Next >"
        variant="secondary"
        onMouseDown={nextPage}
        uiTransform={{ width: 91, height: 36 }}
        fontSize={14}
      />
    </UiEntity>
  )
}
