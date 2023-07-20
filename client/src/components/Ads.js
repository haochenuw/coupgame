import React, { useState, useContext, useEffect } from 'react'

export function AdsPanel() {
    return (
        <div className="ads">
            <div className="ads-group">
            <AmazonCoupAds />
            <AmazonClueAds />
            </div>
            <div className="ads-group">
            <AmazonRummiKubAds/>
            <AmazonUNOAds/>
            </div>
            {/* <GoogleAds /> */}
        </div>
    )
}

export function AmazonCoupAds() {
    return (
        <div className="amazonads">
            <iframe sandbox="allow-popups allow-scripts allow-modals allow-forms allow-same-origin" style={{ width: "130px", height: "260px" }} src="//ws-na.amazon-adsystem.com/widgets/q?ServiceVersion=20070822&OneJS=1&Operation=GetAdHtml&MarketPlace=US&source=ss&ref=as_ss_li_til&ad_type=product_link&tracking_id=coupgame-20&language=en_US&marketplace=amazon&region=US&placement=B00GDI4HX4&asins=B00GDI4HX4&linkId=2c8109ccc2c3c9de1098a305b5110f5b&show_border=true&link_opens_in_new_window=true"></iframe>
        </div>
    )
}

export function AmazonClueAds() {
    return (
        <div className="amazonads">
            <iframe sandbox="allow-popups allow-scripts allow-modals allow-forms allow-same-origin" style={{ width: "130px", height: "260px" }} src="//ws-na.amazon-adsystem.com/widgets/q?ServiceVersion=20070822&OneJS=1&Operation=GetAdHtml&MarketPlace=US&source=ss&ref=as_ss_li_til&ad_type=product_link&tracking_id=coupgame-20&language=en_US&marketplace=amazon&region=US&placement=B01JYVHMVA&asins=B01JYVHMVA&linkId=30a9d49b5bcc045007a16633d2496c59&show_border=true&link_opens_in_new_window=true"></iframe>
        </div>
    )
}

export function AmazonRummiKubAds() {
    return (
        <div className="amazonads">
            <iframe sandbox="allow-popups allow-scripts allow-modals allow-forms allow-same-origin" style={{ width: "130px", height: "260px" }} src="//ws-na.amazon-adsystem.com/widgets/q?ServiceVersion=20070822&OneJS=1&Operation=GetAdHtml&MarketPlace=US&source=ss&ref=as_ss_li_til&ad_type=product_link&tracking_id=coupgame-20&language=en_US&marketplace=amazon&region=US&placement=B00000IZJB&asins=B00000IZJB&linkId=802f18bc8023a2cd559e6d763abaa570&show_border=true&link_opens_in_new_window=true"></iframe>
        </div>
    )
}

export function AmazonUNOAds() {
    return (
        <div className="amazonads">
            <iframe sandbox="allow-popups allow-scripts allow-modals allow-forms allow-same-origin" style={{ width: "130px", height: "260px" }} src="//ws-na.amazon-adsystem.com/widgets/q?ServiceVersion=20070822&OneJS=1&Operation=GetAdHtml&MarketPlace=US&source=ss&ref=as_ss_li_til&ad_type=product_link&tracking_id=coupgame-20&language=en_US&marketplace=amazon&region=US&placement=B005I5M2F8&asins=B005I5M2F8&linkId=75841f6da7e168aced26cec86163102d&show_border=true&link_opens_in_new_window=true"></iframe>        
        </div>
    )
}


export function GoogleAds() {

    useEffect(() => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
        catch (e) {

        }
    }, []);

    return (
        <>
            <ins className="adsbygoogle"
                style={{ display: "inline" }}
                data-ad-client="ca-pub-1240326983530103"
                data-ad-slot="2360313064"
                data-ad-format="auto"
                data-full-width-responsive="true"></ins>
        </>
    )
}