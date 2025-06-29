/* eslint-disable no-unused-vars */
import React from 'react';

const GoogleMap = ({ latitude, longitude, zoom = 15, width = "600", height = "450" }) => {
    const mapSrc = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1000!2d${longitude}!3d${latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sbd!4v${Date.now()}!5m2!1sen!2sbd`;

    return (
        <div>
            <iframe
                src={mapSrc}
                width={width}
                height={height}
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
        </div>
    );
};

export default GoogleMap;