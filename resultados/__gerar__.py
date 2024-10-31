for cluster in [
'7j6122', '6yk7ym', '6znc7w', '6vmm56', '6yk9qc', '7j610p',
'6znce8', '6vx5gz', '6zncec', '6yk9x9', '6gvmzx', '6unst4',
'6vqt8g', '6gv7r0', '6unshd'
  ]:
    text = f"""
# GeoHash {cluster}

![GeoHash Mapa {cluster}](figs/{cluster}_map.png)


![GeoHash Sankey {cluster}](figs/sankey_{cluster}.png)


![GeoHash Porcent {cluster}](figs/{cluster}_porcente.png) 
"""
    with open(f'{cluster}.md', 'w') as f:
        f.write(text)