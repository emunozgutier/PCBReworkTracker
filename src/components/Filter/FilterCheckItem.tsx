import React from 'react';

export interface FilterCheckItemProps {
    value: string;
    children: React.ReactNode;
}

/**
 * FilterCheckItem — a single selectable check row inside a PcbFilterElement.
 *
 * Usage (inside PcbFilterElement):
 *   <FilterCheckItem value="foo">Foo Label</FilterCheckItem>
 *
 * The parent PcbFilterElement reads the `value` and `children` props to render
 * its own styled checkbox UI, so this component itself acts mainly as a
 * typed prop-carrier / descriptor. The actual rendering is done by the parent.
 */
export function FilterCheckItem({ value, children }: FilterCheckItemProps) {
    // Rendered directly only when used outside PcbFilterElement (rare).
    return (
        <option value={value}>{children}</option>
    );
}
