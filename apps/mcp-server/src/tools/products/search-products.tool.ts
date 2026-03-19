import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerAppTool, registerAppResource } from '@modelcontextprotocol/ext-apps/server';
import { createUIResource } from '@mcp-ui/server';
import { z } from 'zod';
import { searchProducts } from './search-products.service.js';

export function registerSearchProductsTool(server: McpServer): void {
    const searchWidgetUI = createUIResource({
        uri: 'ui://letstry-foods/search-widget',
        content: {
            type: 'rawHtml',
            htmlString: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        :root {
            --orange: #ea580c;
            --gray-50: #f9fafb;
            --gray-100: #f3f4f6;
            --gray-200: #e5e7eb;
            --gray-400: #9ca3af;
            --gray-500: #6b7280;
            --gray-900: #111827;
            --bg-white: #ffffff;
        }
        * { box-sizing: border-box; }
        body {
            font-family: system-ui, -apple-system, sans-serif;
            background-color: var(--gray-50);
            color: var(--gray-900);
            margin: 0;
            padding: 16px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid var(--gray-200);
            padding-bottom: 12px;
            margin-bottom: 24px;
        }
        .header h1 {
            color: var(--orange);
            font-size: 24px;
            margin: 0;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .badge-count {
            background: var(--gray-200);
            color: var(--gray-500);
            padding: 6px 14px;
            border-radius: 999px;
            font-size: 14px;
            font-weight: 600;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 16px;
        }
        .card {
            background: var(--bg-white);
            border: 1px solid var(--gray-200);
            border-radius: 12px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            transition: transform 0.2s;
        }
        .card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .img-wrap {
            background: var(--gray-50);
            padding: 20px;
            display: flex;
            justify-content: center;
            position: relative;
            height: 220px;
        }
        .img-wrap img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
            mix-blend-mode: multiply;
        }
        .tag {
            position: absolute;
            top: 10px;
            left: 10px;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: bold;
            color: white;
            box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        .tag-stock { background: #22c55e; }
        .tag-out { background: #ef4444; }
        .tag-discount {
            left: auto;
            right: 10px;
            background: var(--orange);
        }
        .info {
            padding: 16px;
            display: flex;
            flex-direction: column;
            flex-grow: 1;
            border-top: 1px solid var(--gray-100);
        }
        .weight {
            font-size: 12px;
            color: var(--orange);
            text-transform: uppercase;
            font-weight: 700;
            margin-bottom: 6px;
            letter-spacing: 0.5px;
        }
        .title {
            font-size: 16px;
            font-weight: 700;
            margin: 0 0 6px 0;
            line-height: 1.3;
        }
        .desc {
            font-size: 13px;
            color: var(--gray-500);
            margin: 0 0 16px 0;
            flex-grow: 1;
            line-height: 1.5;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        .price-row {
            border-top: 1px solid var(--gray-100);
            padding-top: 12px;
            display: flex;
            align-items: baseline;
            gap: 10px;
        }
        .price {
            font-size: 22px;
            font-weight: 800;
            color: var(--gray-900);
        }
        .mrp {
            font-size: 13px;
            color: var(--gray-400);
            text-decoration: line-through;
            font-weight: 500;
        }
        .loading {
            grid-column: 1 / -1;
            text-align: center;
            padding: 40px;
            color: var(--gray-500);
            font-size: 16px;
            background: white;
            border-radius: 12px;
            border: 1px dashed var(--gray-200);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛒 LetsTry Foods</h1>
            <span id="results-count" class="badge-count">Searching...</span>
        </div>

        <div id="product-grid" class="grid">
            <div class="loading">⏳ Loading products data...</div>
        </div>
    </div>

    <script>
        const CDN_URL = "https://letstry-foods.s3.ap-south-1.amazonaws.com/";

        function renderProducts(data) {
            const grid = document.getElementById('product-grid');
            const countBadge = document.getElementById('results-count');
            
            if (!data || !data.searchProducts || !data.searchProducts.items || data.searchProducts.items.length === 0) {
                grid.innerHTML = '<div class="loading" style="color:#ef4444;">No products found. Start a new search.</div>';
                countBadge.textContent = '0 results';
                return;
            }

            const items = data.searchProducts.items;
            countBadge.textContent = \`\${data.searchProducts.meta.totalCount} results\`;
            grid.innerHTML = '';

            items.forEach(item => {
                const variant = item.defaultVariant || item.variants[0];
                if (!variant) return;

                const imageUrl = variant.thumbnailUrl 
                    ? \`\${CDN_URL}\${variant.thumbnailUrl}\` 
                    : 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D"http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg" width%3D"400" height%3D"400" fill%3D"%23eee"%3E%3Crect width%3D"100%25" height%3D"100%25"%2F%3E%3Ctext x%3D"50%25" y%3D"50%25" fill%3D"%23999" font-family%3D"sans-serif" font-size%3D"20" text-anchor%3D"middle" dy%3D".3em"%3ENo Photo%3C%2Ftext%3E%3C%2Fsvg%3E';

                const isOutOfStock = variant.availabilityStatus === "out_of_stock" || variant.stockQuantity <= 0;
                const stockBadgeCode = isOutOfStock 
                    ? '<div class="tag tag-out">Sold Out</div>'
                    : '<div class="tag tag-stock">In Stock (' + variant.stockQuantity + ')</div>';

                const discountBadgeCode = variant.discountPercent > 0
                    ? \`<div class="tag tag-discount">\${Math.round(variant.discountPercent)}% OFF</div>\`
                    : '';

                const priceSection = variant.mrp > variant.price
                    ? \`<span class="price">₹\${variant.price}</span><span class="mrp">₹\${variant.mrp}</span>\`
                    : \`<span class="price">₹\${variant.price}</span>\`;

                let shortDesc = '';
                if (item.description) {
                    const tmp = document.createElement("DIV");
                    tmp.innerHTML = item.description;
                    let plain = tmp.textContent || tmp.innerText || "";
                    shortDesc = plain.substring(0, 70) + (plain.length > 70 ? '...' : '');
                }

                const card = document.createElement('div');
                card.className = "card";
                
                card.innerHTML = \`
                    <div class="img-wrap">
                        \${stockBadgeCode}
                        \${discountBadgeCode}
                        <img src="\${imageUrl}" alt="\${item.name.replace(/"/g, '&quot;')}">
                    </div>
                    <div class="info">
                        <div class="weight">\${variant.weight || ''} \${variant.weightUnit || ''}</div>
                        <h3 class="title">\${item.name}</h3>
                        \${shortDesc ? \`<p class="desc">\${shortDesc}</p>\` : ''}
                        <div class="price-row">\${priceSection}</div>
                    </div>
                \`;
                grid.appendChild(card);
            });
        }

        window.addEventListener('message', (event) => {
            try {
                if (event.data) {
                    renderProducts(event.data);
                }
            } catch(e) {
                document.getElementById('product-grid').innerHTML = '<div class="loading">Error parsing UI data: ' + e.message + '</div>';
            }
        });
    </script>
</body>
</html>
            `
        },
        encoding: 'text',
    });

    registerAppResource(server, 'search_widget_ui', searchWidgetUI.resource.uri, {}, async () => ({
        contents: [searchWidgetUI.resource],
    }));

    registerAppTool(
        server,
        'search_products',
        {
            description: 'Search for products in the LetsTry Foods catalog by name or keyword. Returns product details including variants, prices, and stock.',
            inputSchema: {
                searchTerm: z.string().describe('Product name or keyword to search for'),
                page: z.number().int().min(1).default(1).describe('Page number'),
                limit: z.number().int().min(1).max(20).default(10).describe('Number of results per page'),
            },
            _meta: {
                ui: { resourceUri: searchWidgetUI.resource.uri },
            },
        },
        async ({ searchTerm, page, limit }) => {
            const result = await searchProducts({ searchTerm, page, limit }) as any;

            // Generate fallback Markdown for environments without UI support (or for Claude's text understanding)
            let mdText = `Found ${result?.searchProducts?.meta?.totalCount || 0} results:\n\n`;

            if (result && result.searchProducts && result.searchProducts.items) {
                result.searchProducts.items.forEach((item: any) => {
                    const v = item.defaultVariant || item.variants[0];
                    if (v) mdText += `- **${item.name}**: ₹${v.price} (${v.weight}${v.weightUnit})\n`;
                });
            }

            return {
                content: [{ type: 'text', text: mdText }],
                data: result, // This is broadcast via postMessage to the iframe
            };
        },
    );
}
