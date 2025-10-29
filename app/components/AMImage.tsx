"use client";

import classNames from 'classnames';
import { AnimatePresence, motion } from 'motion/react';
import { StaticImageData } from 'next/dist/shared/lib/get-img-props';
import Image from 'next/image';
import { useCallback, useState } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

type AMImageProps = { alt: string, skeleton?: boolean, priority?: boolean, className?: string, quality?: number } & ({ src: string, width: number, height: number } | { src: StaticImageData });

export default function AMImage(props: AMImageProps) {

    const [isLoading, setLoading] = useState(true);

    const onImageLoaded = useCallback(() => { console.debug(`Image loaded: ${props.src}`); setLoading(false); }, [props.src]);

    const onImageFailed = useCallback((e: any) => { console.error(`Image unable to load: ${props.src}`, e); setLoading(true); }, [props.src]);

    const uWidth = "width" in props ? props.width : props.src.width;
    const uHeight = "height" in props ? props.height : props.src.height;
    const ratio = uWidth / uHeight;

    return <>

        <div 
            className={classNames("relative", props.className)} 
            style={{ aspectRatio: ratio }}
        >

            <AnimatePresence>

                <motion.div key="image" initial={{ opacity: 0 }} animate={isLoading ? { opacity: 0 } : { opacity: 1 }}>

                    <Image
                        src={props.src}
                        alt={props.alt}
                        width={uWidth}
                        height={uHeight}
                        priority={props.priority ?? false}
                        loading={(props.priority ?? false) ? "lazy" : "eager"}
                        style={{ aspectRatio: ratio }}
                        quality={props.quality}
                        className={classNames({ "invisible": isLoading }, "object-cover absolute w-full rounded-md", props.className)}
                        onLoad={onImageLoaded}
                        onError={onImageFailed} />

                </motion.div>

                {isLoading && <>

                    <motion.div key="skeleton" className="absolute w-full h-full" transition={{ duration: 0.25 }} initial={{ opacity: 0.5 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

                        <SkeletonTheme enableAnimation={true}>
                            <Skeleton className={classNames("w-full h-full", props.className)} />
                        </SkeletonTheme>

                    </motion.div>

                </>}

            </AnimatePresence>


        </div>

    </>
}