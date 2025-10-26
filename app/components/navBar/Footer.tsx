import Link from "next/link";
import HorizontalWrap from "../HorizontalWrap";

export function Footer() : React.ReactElement {return(
        <div className="bg-black w-full h-fit shadow-2xl">
            <HorizontalWrap className="py-12 flex flex-col gap-6 md:gap-12 md:flex-row">
                <div>
                    <p className="font-bold text-gray-100 text-sm">About Us</p>
                    <Link href="/team" className="text-gray-300 my-2 text-xs">
                        Leadership
                    </Link>
                    <br/>
                    <a
                        className="text-gray-300 my-2 text-xs"
                        href="https://maps.app.goo.gl/bLNnJAGoQFB3UPWZ7">
                        PNW Design Studio
                    </a>
                    <br/>
                    <Link href={"/schedule"} className="text-gray-300 my-2 text-xs">
                        Pickup Schedule
                    </Link>
                </div>
                <div>
                    <p className="font-bold text-gray-100 text-sm">
                        Get in Touch
                    </p>
                    <a
                        href="https://discord.gg/YtrnzPAfpV"
                        target="_blank"
                        className="text-gray-300 my-2 text-xs">
                        Join our Discord
                    </a>
                    <br/>
                    <a
                        rel="noopener"
                        title="Visit Github"
                        href="https://github.com/PNW-Additive-Manufacturing"
                        target="_blank"
                        className="text-gray-300 my-2 text-xs">
                        Visit GitHub
                    </a>
                </div>
                <div>
                    <p className="text-gray-300 text-xs">
                        Developed by
                        <a href="mailto:jung416@pnw.edu">Aaron F Jung</a>.
                    </p>
                </div>
            </HorizontalWrap>
        </div>
    );}