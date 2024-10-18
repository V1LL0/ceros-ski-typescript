/**
 * Interface for an Image to provide a name and url
 */

import { IMAGE_NAMES } from "../Constants";

export interface iImage {
    name: IMAGE_NAMES;
    url: string;
}
