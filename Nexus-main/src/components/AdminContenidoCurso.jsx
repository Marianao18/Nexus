import React, { useState } from 'react';
import { useParams } from 'react-router-dom';


const AdminContenidoCurso = () => {

    const { id } = useParams();
    const [modulos, setModulos] = useState([
        { id: 1, titulo: 'Módulo 1 - Introducción' },
        { id: 2, titulo: 'Módulo 2 - Variables' },
        { id: 3, titulo: 'Módulo 3 - Funciones' },
    ]);
    const [nuevoModulo, setNuevoModulo] = useState(''); 
    const agregarModulo = () => {

    if (!nuevoModulo.trim()) return;

    const nuevo = {
        id: Date.now(),
        titulo: nuevoModulo
    };

    setModulos([...modulos, nuevo]);

    setNuevoModulo('');
};
    return (
    <div style={{
        padding:'40px',
        color:'#fff',
        minHeight:'100vh'
    }}>

        {/* HEADER */}
        <div style={{
            display:'flex',
            justifyContent:'space-between',
            alignItems:'center',
            marginBottom:'30px'
        }}>

            <div>
                <h1 style={{
                    fontSize:'42px',
                    margin:'0 0 8px 0'
                }}>
                    Gestión de Contenido
                </h1>

                <p style={{
                    color:'#7A8BA8',
                    fontSize:'14px'
                }}>
                    Curso ID: {id}
                </p>
            </div>

            <button style={{
                background:'#00E5FF',
                border:'none',
                padding:'12px 20px',
                borderRadius:'10px',
                fontWeight:'bold',
                cursor:'pointer',
                fontSize:'14px'
            }}>
                + Agregar módulo
            </button>

        </div>

        {/* CONTENIDO */}
        <div style={{
            display:'grid',
            gridTemplateColumns:'320px 1fr',
            gap:'24px'
        }}>

            {/* SIDEBAR MODULOS */}
            <div style={{
                background:'rgba(10,15,25,0.75)',
                border:'1px solid rgba(0,229,255,0.15)',
                borderRadius:'18px',
                padding:'20px',
                backdropFilter:'blur(12px)',
                height:'fit-content'
            }}>

                <h3 style={{
                    marginBottom:'20px',
                    color:'#00E5FF'
                }}>
                    Módulos
                </h3>

                {/* INPUT NUEVO MODULO */}
                <div style={{
                    display:'flex',
                    gap:'10px',
                    marginBottom:'20px'
                }}>

                    <input
                        type="text"
                        placeholder="Nuevo módulo..."
                        value={nuevoModulo}
                        onChange={(e) => setNuevoModulo(e.target.value)}
                        style={{
                            flex:1,
                            background:'rgba(255,255,255,0.04)',
                            border:'1px solid rgba(255,255,255,0.08)',
                            borderRadius:'10px',
                            padding:'10px',
                            color:'#fff',
                            outline:'none'
                        }}
                    />

                    <button
                        onClick={agregarModulo}
                        style={{
                            background:'#00E5FF',
                            color:'#06111f',
                            border:'none',
                            borderRadius:'10px',
                            padding:'10px 16px',
                            fontWeight:'bold',
                            cursor:'pointer'
                        }}
                    >
                        +
                    </button>

                </div>

                {/* LISTA MODULOS */}
                <div style={{
                    display:'flex',
                    flexDirection:'column',
                    gap:'12px'
                }}>

                    {modulos.map((modulo) => (

                        <div
                            key={modulo.id}
                            style={moduloStyle}
                        >
                            {modulo.titulo}
                        </div>

                    ))}

                </div>

            </div>

            {/* PANEL CONTENIDO */}
            <div style={{
                background:'rgba(10,15,25,0.75)',
                border:'1px solid rgba(0,229,255,0.15)',
                borderRadius:'18px',
                padding:'25px',
                backdropFilter:'blur(12px)'
            }}>

                <h2 style={{
                    marginBottom:'20px'
                }}>
                    Contenido del módulo
                </h2>

                {/* CARD VIDEO */}
                <div style={cardStyle}>

                    <div style={{ width:'100%' }}>

                        <h4 style={{
                            margin:'0 0 12px 0'
                        }}>
                            Video Introducción
                        </h4>

                        <iframe
                            width="100%"
                            height="500"
                            src={"https://www.youtube.com/embed/d2rUnDzpVRI"}
                            title="Video del curso"
                            frameBorder="0"
                            allowFullScreen
                            style={{
                                borderRadius:'12px',
                                border:'none'
                            }}
                        />

                    </div>

                </div>

                {/* CARD PDF */}
                <div style={cardStyle}>

                    <div style={{ width:'100%' }}>

                        <h4 style={{
                            margin:'0 0 12px 0'
                        }}>
                            PDF del curso
                        </h4>

                        <iframe
                            src="https://docs.google.com/gview?embedded=1&url=https://dspace.ups.edu.ec/bitstream/123456789/24037/4/Gui%CC%81a%20de%20aprendizaje%20de%20programacio%CC%81n.pdf"
                            width="100%"
                            height="600"
                            style={{
                                border:'none',
                                borderRadius:'12px'
                            }}
                            title="PDF"
                        />

                    </div>

                </div>

            </div>

        </div>

    </div>
);
};

const cardStyle = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px',
    padding: '14px',
    marginTop: '12px',
};

const btnStyle = {
    background: '#00E5FF',
    color: '#06111f',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 18px',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '13px',
    marginTop: '12px',
};
const moduloStyle = {
    background:'rgba(255,255,255,0.04)',
    border:'1px solid rgba(0,229,255,0.15)',
    borderRadius:'12px',
    padding:'14px 18px',
    color:'#fff',
    fontWeight:'600',
    cursor:'pointer',
    transition:'0.2s'
};
export default AdminContenidoCurso;