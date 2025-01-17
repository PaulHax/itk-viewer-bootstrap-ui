import React, { useRef } from 'react'
import { useSelector } from '@xstate/react'
import {
  visibleIconDataUri,
  invisibleIconDataUri,
  pauseIconDataUri,
  playIconDataUri
} from 'itk-viewer-icons'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Image from 'react-bootstrap/Image'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'
import cn from 'classnames'
import Badge from 'react-bootstrap/Badge'
import '../style.css'

const planes = ['x', 'y', 'z']

function PlaneSliders({ service }) {
  const { send } = service
  const xVisibility = useRef(null)
  const yVisibility = useRef(null)
  const zVisibility = useRef(null)
  const xScroll = useRef(null)
  const yScroll = useRef(null)
  const zScroll = useRef(null)
  const planeSliders = useRef(null)
  const visRefs = [xVisibility, yVisibility, zVisibility]
  const scrollRefs = [xScroll, yScroll, zScroll]
  const slicingPlanes = useSelector(
    service,
    (state) => state.context.main.slicingPlanes
  )

  const stateContextUiCollapsed = useSelector(
    service,
    (state) => state.context.uiCollapsed
  )
  const stateContextUse2D = useSelector(service, (state) => state.context.use2D)

  // Force re-render so sliders disappear in 2D mode
  const viewMode = useSelector(service, (state) => state.context.main.viewMode)

  // Force re-render for 2D view modes
  const planeSlice2D = planes.map((plane) =>
    useSelector(service, (state) => state.context.main[`${plane}Slice`])
  )

  // Force re-render for visibility button
  const slicingPlanesVisibility = planes.map((plane) =>
    useSelector(
      service,
      (state) => state.context.main.slicingPlanes[`${plane}`].visible
    )
  )

  // Force re-render for play/pause button
  const slicingPlanesScroll = useSelector(
    service,
    (state) =>
      planes.map(
        (plane) => state.context.main.slicingPlanes[`${plane}`].scroll
      ),
    (a, b) => a.length === b.length && a.every((x, i) => x === b[i])
  )

  const toggleVisibility = (plane) => {
    slicingPlanes[plane].visible = !slicingPlanes[plane].visible
    send({ type: 'SLICING_PLANES_CHANGED', data: slicingPlanes })
  }

  const togglePlay = (plane) => {
    slicingPlanes[plane].scroll = !slicingPlanes[plane].scroll
    if (slicingPlanes[plane].scroll && !slicingPlanes[plane].visible) {
      toggleVisibility(plane)
    }
    send({ type: 'SLICING_PLANES_CHANGED', data: slicingPlanes })
  }

  const handleSliderChange = (plane, val) => {
    send({
      type: `${plane.toUpperCase()}_SLICE_CHANGED`,
      data: Number(val)
    })
  }

  const sliderVisible = (plane) => {
    const isVolume = viewMode === 'Volume' && !stateContextUse2D
    const planeVisible = viewMode === `${plane.toUpperCase()}Plane`
    if (!isVolume && !planeVisible) {
      return 'hiddenSlider'
    }
    return ''
  }

  const slidersClass = cn({
    hiddenSlider: stateContextUiCollapsed
  })

  return (
    <div ref={planeSliders} className={slidersClass}>
      {planes.map((plane, idx) => {
        return (
          planeSlice2D[idx] !== null &&
          !service.machine.context.use2D && (
            <div key={plane.toUpperCase()}>
              <div className="input-group">
                <OverlayTrigger
                  transition={false}
                  overlay={
                    <Tooltip>{plane.toUpperCase()} Plane Visibility</Tooltip>
                  }
                >
                  <Button
                    className={cn(
                      `icon-button ${
                        viewMode !== 'Volume' ? 'hiddenSlider' : ''
                      }`,
                      {
                        checked: slicingPlanesVisibility[idx]
                      }
                    )}
                    onClick={(_e) => {
                      toggleVisibility(plane)
                    }}
                    variant="secondary"
                    ref={visRefs[idx]}
                  >
                    {slicingPlanes[plane].visible ? (
                      <Image src={visibleIconDataUri}></Image>
                    ) : (
                      <Image src={invisibleIconDataUri}></Image>
                    )}
                  </Button>
                </OverlayTrigger>
                <OverlayTrigger
                  transition={false}
                  overlay={
                    <Tooltip>{`${plane.toUpperCase()} Plane Toggle Scroll`}</Tooltip>
                  }
                >
                  <Button
                    className={cn(
                      `icon-button ${
                        viewMode !== `${plane.toUpperCase()}Plane` &&
                        viewMode !== 'Volume'
                          ? 'hiddenSlider'
                          : ''
                      }`,
                      {
                        checked: slicingPlanesScroll[idx]
                      }
                    )}
                    onClick={(_e) => {
                      togglePlay(plane)
                    }}
                    variant="secondary"
                    ref={scrollRefs[idx]}
                  >
                    {slicingPlanes[plane].scroll ? (
                      <Image src={pauseIconDataUri}></Image>
                    ) : (
                      <Image src={playIconDataUri}></Image>
                    )}
                  </Button>
                </OverlayTrigger>
                <Badge
                  className={`labelBadge ${plane}badge ${
                    viewMode !== `${plane.toUpperCase()}Plane` &&
                    viewMode !== 'Volume'
                      ? 'hiddenSlider'
                      : ''
                  }`}
                  bg="secondary"
                >
                  {plane.toUpperCase()}: {planeSlice2D[idx]?.toPrecision(4)}
                </Badge>
                <div
                  key={plane.toUpperCase()}
                  className={`planeSliders ${sliderVisible(plane)}`}
                >
                  <Form.Control
                    type="range"
                    custom
                    min={slicingPlanes[plane].min}
                    max={slicingPlanes[plane].max}
                    value={planeSlice2D[idx]}
                    step={slicingPlanes[plane].step}
                    onChange={(_e) => {
                      handleSliderChange(plane, _e.target.value)
                    }}
                  />
                </div>
              </div>
            </div>
          )
        )
      })}
    </div>
  )
}

export default PlaneSliders
