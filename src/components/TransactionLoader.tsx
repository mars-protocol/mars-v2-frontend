import classNames from 'classnames'

import Text from 'components/Text'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { REDUCE_MOTION_KEY } from 'constants/localStore'
import useLocalStorage from 'hooks/useLocalStorage'

export default function TransactionLoader() {
  const [reduceMotion] = useLocalStorage<boolean>(REDUCE_MOTION_KEY, DEFAULT_SETTINGS.reduceMotion)

  return (
    <>
      <div className='absolute z-50 flex flex-wrap items-center content-center justify-center w-full h-full text-white bg-black/80'>
        <div className='w-[120px] h-[120px]'>
          <svg version='1.1' x='0px' y='0px' viewBox='0 0 120 120'>
            <path
              className={classNames(
                !reduceMotion && 'opacity-0 animate-loaderFade',
                'animate-delay-[500ms]',
              )}
              fill='none'
              stroke='currentColor'
              strokeWidth='1'
              strokeMiterlimit='10'
              d='M104.5,27.7L92.3,15.5L77,7.7L60,5
L43,7.7l-15.3,7.8L15.5,27.7L7.7,43L5,60l2.7,17l7.8,15.3l12.2,12.2l15.3,7.8l17,2.7l17-2.7l15.3-7.8l12.2-12.2l7.8-15.3l2.7-17
l-2.7-17L104.5,27.7z'
            />
            <line
              className={classNames(
                !reduceMotion && 'opacity-0 animate-loaderFade',
                'animate-delay-[700ms]',
              )}
              fill='none'
              stroke='currentColor'
              strokeMiterlimit='10'
              x1='60'
              y1='60'
              x2='27.7'
              y2='15.5'
            />
            <line
              className={classNames(
                !reduceMotion && 'opacity-0 animate-loaderFade',
                'animate-delay-[900ms]',
              )}
              fill='none'
              stroke='currentColor'
              strokeMiterlimit='10'
              x1='60'
              y1='60'
              x2='92.3'
              y2='15.5'
            />
            <line
              className={classNames(
                !reduceMotion && 'opacity-0 animate-loaderFade',
                'animate-delay-[1100ms]',
              )}
              fill='none'
              stroke='currentColor'
              strokeMiterlimit='10'
              x1='112.3'
              y1='77'
              x2='60'
              y2='60'
            />
            <line
              className={classNames(
                !reduceMotion && 'opacity-0 animate-loaderFade',
                'animate-delay-[1300ms]',
              )}
              fill='none'
              stroke='currentColor'
              strokeMiterlimit='10'
              x1='60'
              y1='115'
              x2='60'
              y2='60'
            />
            <line
              className={classNames(
                !reduceMotion && 'opacity-0 animate-loaderFade',
                'animate-delay-[1500ms]',
              )}
              fill='none'
              stroke='currentColor'
              strokeMiterlimit='10'
              x1='7.7'
              y1='77'
              x2='60'
              y2='60'
            />
            <polygon
              className={classNames(
                !reduceMotion && 'opacity-0 animate-loaderFade',
                'animate-delay-[1800ms]',
              )}
              fill='none'
              stroke='currentColor'
              strokeMiterlimit='10'
              points='47.5,42.9 72.3,43 80.1,66.5 60,81.1 
39.8,66.5 '
            />
            <polygon
              className={classNames(
                !reduceMotion && 'opacity-0 animate-loaderFade',
                'animate-delay-[2100ms]',
              )}
              fill='none'
              stroke='currentColor'
              strokeMiterlimit='10'
              points='60,22.1 47.5,42.9 23.9,48.3 39.8,66.5 
37.7,90.7 60,81.1 82.3,90.7 80.1,66.5 96.1,48.3 72.3,43 '
            />
            <polygon
              className={classNames(
                !reduceMotion && 'opacity-0 animate-loaderFade',
                'animate-delay-[2400ms]',
              )}
              fill='none'
              stroke='currentColor'
              strokeMiterlimit='10'
              points='34.4,24.8 60,22.1 85.5,24.8 96.1,48.3 
101.3,73.4 82.3,90.7 60,103.5 37.7,90.7 18.6,73.4 23.9,48.3 '
            />
            <polygon
              className={classNames(
                !reduceMotion && 'opacity-0 animate-loaderFade',
                'animate-delay-[2500ms]',
              )}
              fill='none'
              stroke='currentColor'
              strokeLinejoin='round'
              strokeMiterlimit='10'
              points='34.4,24.8 43,7.7 
60,22.1 77,7.7 85.5,24.8 104.5,27.7 96.1,48.3 115,60 101.3,73.4 104.5,92.3 82.3,90.7 77,112.3 60,103.5 43,112.3 37.7,90.7 
15.5,92.3 18.6,73.4 5,60 23.9,48.3 15.5,27.7 '
            />
            <line
              className={classNames(
                !reduceMotion && 'opacity-0 animate-loaderFade',
                'animate-delay-[2500ms]',
              )}
              fill='none'
              stroke='currentColor'
              strokeMiterlimit='10'
              x1='60'
              y1='5'
              x2='60'
              y2='22.1'
            />
            <line
              className={classNames(
                !reduceMotion && 'opacity-0 animate-loaderFade',
                'animate-delay-[2500ms]',
              )}
              fill='none'
              stroke='currentColor'
              strokeMiterlimit='10'
              x1='112.3'
              y1='43'
              x2='96.1'
              y2='48.3'
            />
            <line
              className={classNames(
                !reduceMotion && 'opacity-0 animate-loaderFade',
                'animate-delay-[2500ms]',
              )}
              fill='none'
              stroke='currentColor'
              strokeMiterlimit='10'
              x1='92.3'
              y1='104.5'
              x2='82.3'
              y2='90.7'
            />
            <line
              className={classNames(
                !reduceMotion && 'opacity-0 animate-loaderFade',
                'animate-delay-[2500ms]',
              )}
              fill='none'
              stroke='currentColor'
              strokeMiterlimit='10'
              x1='27.7'
              y1='104.5'
              x2='37.7'
              y2='90.7'
            />
            <line
              className={classNames(
                !reduceMotion && 'opacity-0 animate-loaderFade',
                'animate-delay-[2500ms]',
              )}
              fill='none'
              stroke='currentColor'
              strokeLinejoin='round'
              strokeMiterlimit='10'
              x1='7.7'
              y1='43'
              x2='23.9'
              y2='48.3'
            />
            <polygon
              className={classNames(
                !reduceMotion && 'animate-loaderGlow',
                'opacity-0 animate-delay-[5500ms]',
              )}
              fill='currentColor'
              points='60,60 72.3,43 80.1,66.5 '
            />
            <polygon
              className={classNames(
                !reduceMotion && 'animate-loaderGlow',
                'opacity-0 animate-delay-[11000ms]',
              )}
              fill='currentColor'
              points='60,22.1 47.5,42.9 34.4,24.8 '
            />
            <polygon
              className={classNames(
                !reduceMotion && 'animate-loaderGlow',
                'opacity-0 animate-delay-[16500ms]',
              )}
              fill='currentColor'
              points='39.8,66.5 37.7,90.7 60,81.1 '
            />
            <polygon
              className={classNames(
                !reduceMotion && 'animate-loaderGlow',
                'opacity-0 animate-delay-[22000ms]',
              )}
              fill='currentColor'
              points='18.6,73.4 23.9,48.3 5,60 '
            />
            <polygon
              className={classNames(
                !reduceMotion && 'animate-loaderGlow',
                'opacity-0 animate-delay-[27500ms]',
              )}
              fill='currentColor'
              points='82.3,90.7 101.3,73.4 104.5,92.3 '
            />
            <polygon
              className={classNames(
                !reduceMotion && 'animate-loaderGlow',
                'opacity-0 animate-delay-[33000ms]',
              )}
              fill='currentColor'
              points='96.1,48.3 104.5,27.7 112.3,43 '
            />
            <polygon
              className={classNames(
                !reduceMotion && 'animate-loaderGlow',
                'opacity-0 animate-delay-[38500ms]',
              )}
              fill='currentColor'
              points='85.5,24.8 77,7.7 91.9,15.3 '
            />
            <polygon
              className={classNames(
                !reduceMotion && 'animate-loaderGlow',
                'opacity-0 animate-delay-[44000ms]',
              )}
              fill='currentColor'
              points='60,103.5 82.3,90.7 60,81.1 '
            />
            <polygon
              className={classNames(
                !reduceMotion && 'animate-loaderGlow',
                'opacity-0 animate-delay-[49500ms]',
              )}
              fill='currentColor'
              points='15.8,92.3 37.7,90.7 18.6,73.4 '
            />
            <polygon
              className={classNames(
                !reduceMotion && 'animate-loaderGlow',
                'opacity-0 animate-delay-[55000ms]',
              )}
              fill='currentColor'
              points='15.8,27.4 34.4,24.8 23.9,48.3 '
            />
            <polygon
              className={classNames(
                !reduceMotion && 'animate-loaderGlow',
                'opacity-0 animate-delay-[60500ms]',
              )}
              fill='currentColor'
              points='43,7.7 60,5 60,22.1 '
            />
          </svg>
        </div>
        <Text
          className={classNames(
            'p-4 text-center text-white/70 w-full',
            !reduceMotion && 'animate-fadein delay-4000',
          )}
        >
          Broadcasting transaction...
        </Text>
      </div>
    </>
  )
}
