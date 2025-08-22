"use client";

import { useCallback, useRef, useState } from 'react';
import Image from 'next/image';
import classNames from 'classnames';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

export default function AMImage({ src, alt, width, height, priority, className }: { src: string, alt: string, width: number, height: number, priority?: boolean, className?: string }) {

    if (priority === undefined) priority = false;

    const [isLoading, setLoading] = useState(true);

    const onImageLoaded = useCallback(() => { console.debug(`Image loaded: ${src}`); setLoading(false); }, [src]);

    const onImageFailed = useCallback((e: any) => { console.error(`Image unable to load: ${src}`, e); setLoading(true); }, [src])

    return <>

        <div className={classNames("relative", className)} style={{ aspectRatio: width / height }}>

            <Image
                src={src}
                alt={alt}
                width={width}
                height={height}
                priority={priority}
                loading={"lazy"}
                style={{ aspectRatio: width / height }}
                className={classNames({ "invisible": isLoading }, "object-cover absolute", className)}
                onLoad={onImageLoaded}
                onError={onImageFailed} />

            {isLoading && <>

                <div className="absolute w-full h-full">

                    <SkeletonTheme enableAnimation={true}>
                        <Skeleton className={classNames("w-full h-full", className)} />
                    </SkeletonTheme>

                </div>

            </>}

        </div>

    </>
}