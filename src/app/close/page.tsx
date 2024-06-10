// This should be a client side only page, so we can use the client hook.
'use client';

// The page do not have any functionality, it is just a page to show the user that login is successful, and close the page after 3 seconds.

import React from 'react';

export default function ClosePage() {
    React.useEffect(() => {
        setTimeout(() => {
            window.close();
        }, 3000);
    }, []);
    return (
        <div className="flex h-screen items-center justify-center">
            <div className="text-2xl font-semibold text-center">
                登入成功，請重新打開Chrome Extension即可開始對話，此頁面將在3秒後關閉！
            </div>
        </div>
    );
}