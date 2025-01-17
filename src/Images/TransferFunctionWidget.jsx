import { useSelector } from '@xstate/react'
import React, { useEffect, useRef } from 'react'

import '../style.css'
import { getSelectedImageContext } from './getSelectedImageContext'
import { setup } from './transferFunctionWidgetUtils'

const selectLookupTable = (state) => {
  const { selectedComponent } = getSelectedImageContext(state)
  const lookupTableProxy =
    state.context.images.lookupTableProxies?.get(selectedComponent)
  return [lookupTableProxy, lookupTableProxy?.getPresetName()]
}

const lookupProxyCompare = ([, oldName], [, newName]) => oldName === newName

const selectColorRangeNormalized = (state) => {
  const { selectedComponent, colorRanges, colorRangeBounds } =
    getSelectedImageContext(state)
  const colorRange = colorRanges.get(selectedComponent) ?? [0, 1]
  const fullRange = colorRangeBounds.get(selectedComponent) ?? colorRange
  const diff = fullRange[1] - fullRange[0]
  const colorRangeNormalized = [
    (colorRange[0] - fullRange[0]) / diff,
    (colorRange[1] - fullRange[0]) / diff
  ]
  return colorRangeNormalized
}

const areArraysEqual = (a, b) =>
  a.length === b.length && a.every((aValue, index) => aValue === b[index])

const selectHistogram = (state) => {
  const { selectedComponent, histograms } = getSelectedImageContext(state)
  return histograms.get(selectedComponent)
}

function TransferFunctionWidget({ service }) {
  const transferFunctionWidgetContainer = useRef(null)
  const transferFunctionWidget = useRef(null)

  useEffect(() => {
    if (transferFunctionWidgetContainer.current) {
      transferFunctionWidget.current = setup(
        service.machine.context,
        transferFunctionWidgetContainer.current
      )
    }
  }, [transferFunctionWidgetContainer, service.machine.context])

  const [lookupTable, presetNameToTriggerUpdate] = useSelector(
    service,
    selectLookupTable,
    lookupProxyCompare
  )
  useEffect(() => {
    if (transferFunctionWidget.current && lookupTable) {
      transferFunctionWidget.current.setColorTransferFunction(
        lookupTable.getLookupTable()
      )
    }
  }, [transferFunctionWidget, presetNameToTriggerUpdate, lookupTable])

  const colorRangeNormalized = useSelector(
    service,
    selectColorRangeNormalized,
    areArraysEqual
  )
  useEffect(() => {
    transferFunctionWidget.current.setRangeZoom(colorRangeNormalized)
  }, [colorRangeNormalized, transferFunctionWidget])

  const histogram = useSelector(service, selectHistogram)
  useEffect(() => {
    if (histogram) transferFunctionWidget.current.setHistogram(histogram)
  }, [histogram, transferFunctionWidget])

  return (
    <div className="uiRow" style={{ background: 'rgba(127, 127, 127, 0.5)' }}>
      <div className="piecewiseWidget" ref={transferFunctionWidgetContainer} />
    </div>
  )
}

export default TransferFunctionWidget
