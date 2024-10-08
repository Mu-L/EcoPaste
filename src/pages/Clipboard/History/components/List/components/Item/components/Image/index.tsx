import type { HistoryItem } from "@/types/database";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import type { FC } from "react";

const Image: FC<Partial<HistoryItem>> = (props) => {
	const { value = "" } = props;

	const [src, setSrc] = useState("");

	useMount(async () => {
		const src = await convertFileSrc(value);

		setSrc(src);
	});

	return <img src={src} className="max-h-full" />;
};

export default memo(Image);
