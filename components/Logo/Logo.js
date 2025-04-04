import { faBrain } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Link from "next/link"

export const Logo = () => {
    return <Link href={'/'}><div className=" text-3xl text-center py-4 font-heading">
        CalibritiUS
        <FontAwesomeIcon icon={faBrain} className="text-2xl text-slate-400 pl-2"/>
    </div></Link>
}