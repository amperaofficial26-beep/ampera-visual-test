import streamlit as st
import streamlit.components.v1 as components

st.set_page_config(page_title="Ampera Visual Test", page_icon="🏞️", layout="wide")

# Isi URL ini setelah folder docs/ project dideploy ke GitHub Pages.
GAME_URL = "https://GITHUB_USERNAME.github.io/ampera-visual-test/"

st.title("🏞️ Ampera Visual Test")
st.caption("Demo eksplorasi 3D: manusia, desa medieval, pemandangan sore, dan monster hutan.")

if "GITHUB_USERNAME" in GAME_URL:
    st.info("Deploy folder docs ke GitHub Pages, lalu masukkan URL GitHub Pages ke GAME_URL di app.py.")
else:
    components.iframe(GAME_URL, height=850, scrolling=False)

st.caption("Kontrol dalam demo: WASD / tombol panah untuk berjalan • klik-drag untuk memutar kamera • scroll untuk zoom")
