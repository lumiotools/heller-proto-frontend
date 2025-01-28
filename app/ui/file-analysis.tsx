import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-regular-svg-icons";

export default function FileAnalysis() {
    return (
        <div>
            <div>
                <img src="" alt="" />
            </div>
            <div>
                <div></div>
                <input type="text" placeholder="ask specific questions here" />
                <button><FontAwesomeIcon icon={faPaperPlane} /></button>
            </div>
        </div>
    )
}
