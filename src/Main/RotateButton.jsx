import React, { useEffect, useRef } from 'react'
import { useActor } from '@xstate/react'
import { Icon, ToggleButton, Tooltip } from '@mui/material'
import { rotateIconDataUri } from 'itk-viewer-icons'
import '../style.css'

function RotateButton(props) {
  const { service } = props
  const rotateButton = useRef(null)
  const [ state, send ] = useActor(service)

  useEffect(() => {
    state.context.main.rotateButtonLabel = rotateButton.current
  }, [])

  return(
    <label ref={ rotateButton } data-tooltip-left data-tooltip='Spin in 3D [p]'>
      <ToggleButton
        size='small'
        className='toggleButton'
        value='rotating'
        selected={ state.context.main.rotateEnabled }
        onChange={() => { send('TOGGLE_ROTATE') }}
      >
        <Icon>
          <img src={ rotateIconDataUri } />
        </Icon>
      </ToggleButton>
    </label>
  )
}

export default RotateButton
