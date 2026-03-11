export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center">
                <img src="/images/logo.png" alt="Padelah" className="size-8" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-2xl">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    <span className="text-padel-primary">padelah</span>
                    <span className="text-padel-success">.com</span>
                </span>
            </div>
        </>
    );
}

